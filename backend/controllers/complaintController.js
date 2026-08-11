const Complaint = require("../models/Complaint");
const User = require("../models/User");
const { cloudinary } = require("../utils/cloudinary");
const { analyzeImage } = require('../utils/aiTriage');
const { emitComplaintCreated, emitComplaintUpdated, emitCriticalAlert } = require("../utils/socket");
const { sendEmergencyAlert, sendStatusUpdateEmail } = require("../utils/emailService");

// --- HELPER FUNCTION FOR SMART ESCALATION ---
const calculatePriorityScore = (complaint) => {
    const now = new Date();
    const filedDate = new Date(complaint.createdAt);
    const hoursStale = (now - filedDate) / (1000 * 60 * 60);

    let baseWeight = 0;
    if (complaint.status === "Critical") baseWeight = 1000;
    else if (complaint.urgency === "High") baseWeight = 500;
    else if (complaint.urgency === "Medium") baseWeight = 250;

    const escalation = hoursStale * 2; 

    return baseWeight + escalation;
};

// 1. Create a complaint (Student)
async function createComplaint(req, res) {
    try {
        const { title, description, category, image, block } = req.body;
        let imageUrl = "";
        let aiAnalysis = { urgency: 'Low', tags: [] };

        const hazardKeywords = ['fire', 'spark', 'electric', 'smoke', 'emergency', 'blast', 'short circuit'];
        const textIsHazard = hazardKeywords.some(word => 
            title.toLowerCase().includes(word) || 
            description.toLowerCase().includes(word)
        );
        const categoryIsHazard = ['electrical', 'electricity'].includes(category.toLowerCase());

        if (image) {
            try {
                if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== "your_cloud_name") {
                    const uploadResponse = await cloudinary.uploader.upload(image, { folder: "hostel_complaints" });
                    imageUrl = uploadResponse.secure_url;
                } else {
                    imageUrl = image;
                }
            } catch (cloudErr) {
                console.log("⚠️ Cloudinary upload skipped/failed - using direct image data fallback");
                imageUrl = image;
            }

            try {
                aiAnalysis = await analyzeImage(imageUrl);
            } catch (aiErr) {
                console.log("⚠️ AI Analysis Error - Falling back to Text Triage:", aiErr.message);
            }
        }

        const isCritical = textIsHazard || categoryIsHazard || aiAnalysis.urgency === 'High';

        const complaint = await Complaint.create({
            student: req.user._id,
            title,
            description,
            category,
            images: imageUrl ? [imageUrl] : [], 
            block: block || "General",
            status: isCritical ? "Critical" : "Open", 
            urgency: isCritical ? "High" : "Low",
            aiTags: aiAnalysis.tags.length > 0 ? aiAnalysis.tags : ["Text-Triaged"]
        });

        await complaint.populate("student", "name email");

        // 🔌 WebSockets Live Broadcast
        emitComplaintCreated(complaint);
        if (isCritical) {
            emitCriticalAlert(complaint);
            
            // 📧 Send Emergency Email Alert to Admin & Block Wardens
            const blockWardens = await User.find({ role: "warden", block: complaint.block });
            const recipientEmails = [
                process.env.ADMIN_EMAIL || 'admin@hostel360.com',
                ...blockWardens.map(w => w.email)
            ].filter(Boolean);

            recipientEmails.forEach(email => {
                sendEmergencyAlert({
                    toEmail: email,
                    complaintTitle: complaint.title,
                    block: complaint.block,
                    category: complaint.category,
                    aiTags: complaint.aiTags
                });
            });
        }

        res.status(201).json(complaint);
    } catch (err) {
        console.error("Submission Error:", err);
        res.status(500).json({ message: "Server error" });
    }
}

// 2. Get all complaints with SMART ESCALATION (Admin)
async function getAllComplaints(req, res) {
  try {
    const rawComplaints = await Complaint.find()
      .populate("student", "name email")
      .populate("warden", "name email")
      .populate("comments.user", "name role");

    const sortedComplaints = rawComplaints.map(c => {
        const score = calculatePriorityScore(c);
        return { ...c._doc, priorityScore: score };
    }).sort((a, b) => b.priorityScore - a.priorityScore);

    res.status(200).json(sortedComplaints);
  } catch (err) {
    console.error("Error in getAllComplaints:", err);
    res.status(500).json({ message: "Server error fetching complaints" });
  }
}

// 3. Get complaints for logged-in student
async function getMyComplaints(req, res) {
    try {
        const complaints = await Complaint.find({ student: req.user._id })
          .populate("warden", "name email")
          .populate("comments.user", "name role");
        res.status(200).json(complaints);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

// 4. Update complaint status and add comments (Warden/Admin)
async function updateComplaint(req, res) {
  try {
    const { status, comment } = req.body;

    const complaint = await Complaint.findById(req.params.id)
      .populate("student", "name email");
      
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    if (complaint.status === "Resolved") {
      return res.status(400).json({ message: "Resolved complaints cannot be modified" });
    }

    if (status) {
      complaint.status = status;
      if (status === "Resolved") complaint.resolvedAt = new Date();
    }

    if (comment && comment.trim() !== "") {
      complaint.comments.push({
        text: comment,
        user: req.user._id,
      });
    }

    if (!complaint.block) complaint.block = "GENERAL";

    await complaint.save();
    await complaint.populate("comments.user", "name role");
    await complaint.populate("warden", "name email");

    // 🔌 WebSockets Live Broadcast
    emitComplaintUpdated(complaint);

    // 📧 Send Status Update Email to Student
    if (complaint.student?.email) {
      sendStatusUpdateEmail({
        studentEmail: complaint.student.email,
        studentName: complaint.student.name,
        complaintTitle: complaint.title,
        status: complaint.status,
        comment: comment || ""
      });
    }

    res.status(200).json(complaint);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// 5. Assign a complaint to a warden (Admin)
const assignComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { wardenId } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    complaint.warden = wardenId;
    if (complaint.status === "Open") complaint.status = "In Progress";
    complaint.assignedAt = new Date();
    if (!complaint.block) complaint.block = "GENERAL";

    await complaint.save();
    await complaint.populate("student", "name email");
    await complaint.populate("warden", "name email");

    // 🔌 WebSockets Live Broadcast
    emitComplaintUpdated(complaint);

    // 📧 Send Email Alert to Assigned Warden
    if (complaint.warden?.email) {
      sendEmergencyAlert({
        toEmail: complaint.warden.email,
        complaintTitle: complaint.title,
        block: complaint.block,
        category: complaint.category,
        aiTags: complaint.aiTags
      });
    }

    res.status(200).json(complaint);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
    createComplaint,
    getAllComplaints,
    getMyComplaints,
    updateComplaint,
    assignComplaint
};