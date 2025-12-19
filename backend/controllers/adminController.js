const Complaint = require("../models/Complaint");
const User = require("../models/User");

// -------------------- Analytics --------------------

async function getComplaintAnalytics(req, res) {
  try {
    // 1. Complaints per category (For Pie Chart)
    const categoryStats = await Complaint.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    // 2. Complaints per Block (For Bar Chart)
    // We join with the User model to see which blocks have the most complaints
    const blockStats = await Complaint.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "student", // or "warden" depending on your logic
          foreignField: "_id",
          as: "userDetails"
        }
      },
      { $unwind: "$userDetails" },
      { $group: { _id: "$userDetails.block", count: { $sum: 1 } } }
    ]);

    // 3. Average resolution time
    const resolvedComplaints = await Complaint.find({ status: "Resolved" });
    let totalHours = 0;
    resolvedComplaints.forEach(c => {
      const created = new Date(c.createdAt);
      const resolved = new Date(c.updatedAt);
      totalHours += (resolved - created) / (1000 * 60 * 60);
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
    res.status(500).json({ message: "Analytics Error", error: err.message });
  }
}

// -------------------- User Management --------------------

// Get Wardens only
async function getAllWardens(req, res) {
  try {
    const wardens = await User.find({ role: "warden" }).select("-password");
    res.status(200).json(wardens);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

// Get Students only
async function getAllStudents(req, res) {
  try {
    const students = await User.find({ role: "student" }).select("-password");
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

async function deleteStudent(req, res) {
    try {
        const user = await User.findById(req.params.id);
        if (!user || user.role !== "student") {
            return res.status(404).json({ message: "Student not found" });
        }
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Student deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error during deletion" });
    }
};

// Create a new Warden account
async function registerWarden(req, res) {
  try {
    const { name, email, password, block } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) return res.status(400).json({ message: "User already exists" });

    const warden = await User.create({
      name,
      email,
      password, // Ensure your User model has a pre-save hook for hashing!
      role: "warden",
      block
    });

    res.status(201).json({ message: "Warden created", warden });
  } catch (err) {
    res.status(500).json({ message: "Creation failed", error: err.message });
  }
}

// Delete a Warden
async function deleteUser(req, res) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Use deleteOne() or findByIdAndDelete() as remove() is deprecated in newer Mongoose
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

//heatmap controller
async function getHotspotData(req, res) {
  try {
    const hotspots = await Complaint.aggregate([
      {
        // 1. Filter out any complaints that accidentally have a null block
        $match: { block: { $exists: true, $ne: null } }
      },
      {
        // 2. Group by the fields
        $group: {
          _id: { 
            block: "$block", 
            category: "$category" 
          },
          count: { $sum: 1 }
        }
      }
    ]);
    console.log("Aggregated Hotspots:", hotspots); // 👈 CHECK YOUR TERMINAL FOR THIS
    res.status(200).json(hotspots);
  } catch (err) {
    res.status(500).json({ message: "Aggregation failed" });
  }
};

module.exports = {
  getComplaintAnalytics,
  getAllWardens,
  getAllStudents,
  registerWarden,
  deleteUser,
  deleteStudent,
  getHotspotData
};