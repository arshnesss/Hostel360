
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

// Get all complaints (Admin/Warden)
async function getAllComplaints(req, res) {
    try {
        const complaints = await Complaint.find()
            .populate("student", "name email")
            .populate("assignedTo", "name email");
        res.status(200).json(complaints);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
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

module.exports = {
    createComplaint,
    getAllComplaints,
    getMyComplaints,
    updateComplaint,
};
