const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: ["plumbing", "electricity", "cleanliness", "internet", "security", "other"], required: true },
    status: { type: String, enum: ["Open", "In Progress", "Resolved"], default: "Open" },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    warden: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    comments: [
    {
      text: String,
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date, default: Date.now },
    },
    ],
    images: [String],
}, { timestamps: true });

module.exports = mongoose.model("Complaint", complaintSchema);
