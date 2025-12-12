const User = require("../models/User");

// ----------------------------------------
// GET LOGGED-IN USER PROFILE
// ----------------------------------------
const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// ----------------------------------------
// UPDATE PROFILE (NAME, EMAIL ONLY)
// ----------------------------------------
const updateMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) return res.status(404).json({ message: "User not found" });

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        await user.save();

        res.status(200).json({ message: "Profile updated", user });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// ----------------------------------------
// ADMIN: GET ALL USERS
// ----------------------------------------
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// ----------------------------------------
// ADMIN: UPDATE USER ROLE (e.g., make Warden)
// ----------------------------------------
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.role = role || user.role;
        await user.save();

        res.status(200).json({ message: "Role updated", user });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// ----------------------------------------
// ADMIN: DELETE USER
// ----------------------------------------
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json({ message: "User deleted" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    getMyProfile,
    updateMyProfile,
    getAllUsers,
    updateUserRole,
    deleteUser,
};
