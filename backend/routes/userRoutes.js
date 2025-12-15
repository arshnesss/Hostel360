const express = require("express");
const router = express.Router();

const User = require("../models/User");

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

// Add this above module.exports
router.get(
  "/wardens",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const wardens = await User.find({ role: "warden" }).select("_id name email");
      res.status(200).json(wardens);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);


module.exports = router;
