const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { getComplaintAnalytics } = require("../controllers/adminController");

// Admin-only analytics endpoint
router.get("/analytics/complaints", protect, authorizeRoles("admin"), getComplaintAnalytics);

module.exports = router;
