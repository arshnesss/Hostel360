const express = require("express");
const router = express.Router();

// Import your controller functions
const {
  getComplaintAnalytics,
  getAllWardens,
  getAllStudents,
  registerWarden,
  deleteUser,
  deleteStudent,
} = require("../controllers/adminController");

// Import your middleware
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

/**
 * @description: Global Middleware for Admin Routes
 * Only authenticated users with the 'admin' role can access these paths.
 */
router.use(protect);
router.use(authorizeRoles("admin"));

// --- Analytics ---
// Matches the useGetAnalyticsQuery in the frontend
router.get("/analytics/complaints", getComplaintAnalytics);

// --- User Management (Students) ---
// Matches the useGetAllStudentsQuery
router.get("/students", getAllStudents);
router.delete("/student/:id", deleteStudent); // Matches adminApi.js url: `/admin/student/${id}`

// --- User Management (Wardens) ---
// Matches the useGetAllWardensQuery, useCreateWardenMutation, and useDeleteWardenMutation
router.get("/wardens", getAllWardens);
router.post("/warden/new", registerWarden);
router.delete("/warden/:id", deleteUser);

module.exports = router;