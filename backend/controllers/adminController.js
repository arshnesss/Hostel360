const Complaint = require("../models/Complaint");
const User = require("../models/User");

// -------------------- Analytics --------------------

// Get complaint analytics for admin dashboard
async function getComplaintAnalytics(req, res) {
  try {
    // Complaints per category
    const categoryStats = await Complaint.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    // Complaints per block/floor
    const blockStats = await Complaint.aggregate([
      { $group: { _id: "$block", count: { $sum: 1 } } }
    ]);

    // Average resolution time (hours)
    const resolvedComplaints = await Complaint.find({ status: "Resolved" });
    let totalHours = 0;
    resolvedComplaints.forEach(c => {
      const created = new Date(c.createdAt);
      const resolved = new Date(c.updatedAt);
      totalHours += (resolved - created) / 1000 / 60 / 60; // convert ms → hours
    });
    const avgResolutionTime = resolvedComplaints.length
      ? totalHours / resolvedComplaints.length
      : 0;

    res.status(200).json({
      categoryStats,
      blockStats,
      avgResolutionTime
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// -------------------- User Management --------------------

// Get all users (students + wardens)
async function getAllUsers(req, res) {
  try {
    const users = await User.find().select("-password"); // exclude password
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// Update a user role (make warden or admin)
async function updateUserRole(req, res) {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = role;
    await user.save();

    res.status(200).json({ message: "User role updated", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// Delete a user
async function deleteUser(req, res) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.remove();
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  getComplaintAnalytics,
  getAllUsers,
  updateUserRole,
  deleteUser
};
