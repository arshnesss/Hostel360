const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["plumbing", "electrical", "cleanliness", "internet", "security", "other"],
      required: true,
    },
    block: { 
      type: String, 
      required: true,
      uppercase: true 
    },
    status: {
      type: String,
      // 🚨 ADDED "Critical" here
      enum: ["Open", "In Progress", "Resolved", "Critical"], 
      default: "Open",
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    warden: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    comments: [
      {
        text: String,
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    images: [String],
    assignedAt: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },

    // AI Triage & Escalation
    urgency: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low"
    },
    aiTags: [String], 
    
    // 🚨 ADDED: To track AI-triggered warnings
    isEscalated: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);