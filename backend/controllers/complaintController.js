
const Complaint = require("../models/Complaint");

// Create a complaint (Student)
async function createComplaint(req, res) {
    try {
        const { title, description, category } = req.body;

        // If files uploaded, get their URLs
        let images = [];
        if (req.files) {
            images = req.files.map(file => file.path);
        }

        const complaint = await Complaint.create({
            student: req.user._id,
            title,
            description,
            category,
            images,
        });

        res.status(201).json(complaint);
    } catch (err) {
        console.error(err);
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
        if (!complaint) return res.status(404).json({ message: "Complaint not found" });

        if (status) complaint.status = status;
        if (comment) {
            complaint.comments.push({ user: req.user._id, comment });
        }
        await complaint.save();
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
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    // Assign the warden
    complaint.warden = wardenId;

    // Optionally, update status to "In Progress" automatically
    if (!complaint.status || complaint.status === "Open") {
      complaint.status = "In Progress";
    }

    await complaint.save();

    res.status(200).json(complaint); // send updated complaint back
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
