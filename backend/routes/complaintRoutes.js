const express = require("express");
const router = express.Router();
const complaintController = require("../controllers/complaintController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const multer = require("multer");
const { storage } = require("../utils/cloudinary");
const Complaint = require("../models/Complaint");

const upload = multer({ storage });

// ===============================
// STUDENT
// ===============================
router.post(
  "/",
  protect,
  authorizeRoles("student"),
  upload.array("images", 5),
  complaintController.createComplaint
);

router.get(
  "/me",
  protect,
  authorizeRoles("student"),
  async (req, res) => {
    try {
      const complaints = await Complaint.find({ student: req.user._id })
        .populate("warden", "name email")
        .populate("comments.user", "name");
      res.status(200).json(complaints);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ===============================
// ADMIN / WARDEN
// ===============================
router.get(
  "/",
  protect,
  authorizeRoles("admin", "warden"),
  complaintController.getAllComplaints
);

router.get(
  "/all",
  protect,
  authorizeRoles("admin", "warden"),
  complaintController.getAllComplaints
);

router.put(
  "/:id",
  protect,
  authorizeRoles("admin", "warden"),
  complaintController.updateComplaint
);

router.put(
  "/:id/assign",
  protect,
  authorizeRoles("admin"),
  complaintController.assignComplaint
);

// ===============================
// WARDEN
// ===============================
router.get(
  "/assigned",
  protect,
  authorizeRoles("warden"),
  async (req, res) => {
    try {
      const queryFilter = req.user.block 
        ? { $or: [{ warden: req.user._id }, { block: req.user.block }] }
        : { warden: req.user._id };

      const complaints = await Complaint.find(queryFilter)
        .populate("student", "name email")
        .populate("warden", "name email")
        .populate("comments.user", "name role");
      res.status(200).json(complaints);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.put(
  "/:id/comment",
  protect,
  authorizeRoles("warden", "admin"),
  async (req, res) => {
    try {
      const complaint = await Complaint.findById(req.params.id);

      complaint.comments.push({
        text: req.body.comment,
        user: req.user._id,
      });

      await complaint.save();

      const updated = await Complaint.findById(req.params.id)
        .populate("comments.user", "name");

      res.status(200).json(updated);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
