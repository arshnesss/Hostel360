const express = require("express");
const router = express.Router();
const complaintController = require("../controllers/complaintController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const multer = require("multer");
const { storage } = require("../utils/cloudinary");

const upload = multer({ storage });

// Student creates complaint with optional images
router.post(
    "/",
    protect,
    authorizeRoles("student"),
    upload.array("images", 5), // max 5 images
    complaintController.createComplaint
);

// Students view their complaints
router.get("/me", protect, authorizeRoles("student"), complaintController.getMyComplaints);

// Admin/Warden view all complaints
router.get("/", protect, authorizeRoles("warden", "admin"), complaintController.getAllComplaints);

// Admin/Warden update complaint
router.put("/:id", protect, authorizeRoles("warden", "admin"), complaintController.updateComplaint);

module.exports = router;
