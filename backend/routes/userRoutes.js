const express = require("express");
const router = express.Router();

const {
    getMyProfile,
    updateMyProfile,
    getAllUsers,
    updateUserRole,
    deleteUser,
} = require("../controllers/userController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// ----------------------------------------
// USER PROFILE ROUTES
// ----------------------------------------
router.get("/me", protect, getMyProfile);         // logged-in user profile
router.put("/me", protect, updateMyProfile);      // update profile

// ----------------------------------------
// ADMIN ROUTES
// ----------------------------------------
router.get("/", protect, authorizeRoles("admin"), getAllUsers);
router.put("/:id/role", protect, authorizeRoles("admin"), updateUserRole);
router.delete("/:id", protect, authorizeRoles("admin"), deleteUser);

module.exports = router;
