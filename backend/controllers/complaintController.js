
const Complaint = require("../models/Complaint");
const {cloudinary} = require("../utils/cloudinary"); // Make sure this is imported!
const { analyzeImage } = require('../utils/aiTriage');

// Create a complaint (Student)
async function createComplaint(req, res) {
    try {
        const { title, description, category, image, block } = req.body;
        let imageUrl = "";
        let aiAnalysis = { urgency: 'Low', tags: [] };

        // 1. 🚀 INSTANT TRIAGE (No Memory Usage)
        // This ensures the Red Banner works even if AI fails
        const hazardKeywords = ['fire', 'spark', 'electric', 'smoke', 'emergency', 'blast', 'short circuit'];
        const textIsHazard = hazardKeywords.some(word => 
            title.toLowerCase().includes(word) || 
            description.toLowerCase().includes(word)
        );
        const categoryIsHazard = category.toLowerCase() === 'electricity';

        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image, { folder: "hostel_complaints" });
            imageUrl = uploadResponse.secure_url;

            // 2. 🤖 ATTEMPT AI (But don't let it crash the request)
            try {
                // We run this, but if it hits that 72MB limit, we catch it
                aiAnalysis = await analyzeImage(imageUrl);
            } catch (aiErr) {
                console.log("⚠️ AI Memory Limit Hit - Falling back to Text Triage");
            }
        }

        // 3. ⚖️ FINAL DECISION
        // If text, category, OR AI says it's a hazard -> set to Critical
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

        res.status(201).json(complaint);
    } catch (err) {
        console.error("Submission Error:", err);
        res.status(500).json({ message: "Server error" });
    }
}

async function getAllComplaints(req, res) {
  try {
    const complaints = await Complaint.find()
      .populate("student", "name email")
      .populate("warden", "name email"); // <-- corrected field

    res.status(200).json(complaints);
  } catch (err) {
    console.error("Error in getAllComplaints:", err);
    res.status(500).json({ message: "Server error fetching complaints" });
  }
}



// Get complaints for logged-in student
async function getMyComplaints(req, res) {
    try {
        const complaints = await Complaint.find({ student: req.user._id });
        res.status(200).json(complaints);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

// Update complaint status and add comments (Warden/Admin)
async function updateComplaint(req, res) {
  try {
    const { status, comment } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // ❌ Do not allow changes after resolved
    if (complaint.status === "Resolved") {
      return res.status(400).json({
        message: "Resolved complaints cannot be modified",
      });
    }

    // ✅ Status update logic
    if (status) {
      complaint.status = status;

      if (status === "Resolved") {
        complaint.resolvedAt = new Date();
      }
    }

    // ✅ Comment logic (FIXED FIELD NAME)
    if (comment && comment.trim() !== "") {
      complaint.comments.push({
        text: comment,           // ✅ MUST be "text"
        user: req.user._id,
      });
    }

    await complaint.save();

    // ✅ Populate so frontend immediately sees comments
    await complaint.populate("comments.user", "name role");

    res.status(200).json(complaint);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}


// Assign a complaint to a warden (Admin)
const assignComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { wardenId } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // ✅ Assign warden
    complaint.warden = wardenId;

    // ✅ Auto move to In Progress
    if (complaint.status === "Open") {
      complaint.status = "In Progress";
    }

    // 🔥 THIS WAS MISSING
    complaint.assignedAt = new Date();

    await complaint.save();

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
