const express = require("express");
const router = express.Router();

// Models
const User = require("../models/User");
const StudentProfile = require("../models/academic");
const Scholarship = require("../models/scholarship");
const { protect, adminOnly } = require("../middleware/auth.js");

// ======================================
// USERS MANAGEMENT
// ======================================

// 1. GET ALL USERS + PROFILES
// GET /api/admin/users
router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password");

    const usersWithProfiles = await Promise.all(
      users.map(async (user) => {
        const profile = await StudentProfile.findOne({ userId: user._id });

        return {
          ...user.toObject(),
          profile: profile || null,
        };
      }),
    );

    res.status(200).json(usersWithProfiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. DELETE USER + PROFILE
// DELETE /api/admin/users/:id
router.delete("/users/:id", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await StudentProfile.findOneAndDelete({ userId: user._id });
    await user.deleteOne();

    res.status(200).json({ message: "User and profile deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ======================================
// SCHOLARSHIP MANAGEMENT
// ======================================

// 3. GET ALL SCHOLARSHIPS
// GET /api/admin/scholarships
router.get("/scholarships", async (req, res) => {
  try {
    const scholarships = await Scholarship.find().sort({ createdAt: -1 });

    res.status(200).json({
      total: scholarships.length,
      scholarships,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. ADD SCHOLARSHIP
// POST /api/admin/scholarships
router.post("/addScholarships", protect, adminOnly, async (req, res) => {
  try {
    const {
      name,
      country,
      degreeLevel,
      minCGPA,
      minIELTS,
      fieldOfStudy,
      deadline,
      link,
      description,
      source,
    } = req.body;

    if (
      !name ||
      !country ||
      !degreeLevel ||
      !fieldOfStudy ||
      !deadline ||
      !link
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const scholarship = await Scholarship.create({
      name,
      country,
      degreeLevel,
      minCGPA,
      minIELTS,
      fieldOfStudy,
      deadline,
      link,
      description,
      source,
      addedBy: "admin",
    });

    res.status(201).json({
      message: "Scholarship created successfully",
      scholarship,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 5. UPDATE SCHOLARSHIP
// PUT /api/admin/scholarships/:id
router.put("/scholarships/:id", protect, adminOnly, async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);

    if (!scholarship) {
      return res.status(404).json({ message: "Scholarship not found" });
    }

    Object.assign(scholarship, req.body);
    await scholarship.save();

    res.status(200).json({
      message: "Scholarship updated successfully",
      scholarship,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 6
// Get /admin/scholarships/:id
router.get("/scholarships/:id", async (req, res) => {
  try {
    console.log("ID received:", req.params.id);

    const scholarship = await Scholarship.findById(req.params.id);

    console.log("Result:", scholarship);

    if (!scholarship) {
      return res.status(404).json({ message: "Scholarship not found" });
    }

    res.status(200).json(scholarship);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});
// 7. DELETE SCHOLARSHIP
// DELETE /api/admin/scholarships/:id
router.delete("/scholarships/:id", protect, adminOnly, async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);

    if (!scholarship) {
      return res.status(404).json({ message: "Scholarship not found" });
    }

    await scholarship.deleteOne();

    res.status(200).json({ message: "Scholarship deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ======================================
// SYSTEM STATS
// ======================================

// 7. GET SYSTEM STATS
// GET /api/admin/stats
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProfiles = await StudentProfile.countDocuments();
    const totalScholarships = await Scholarship.countDocuments();

    const scholarshipsByCountry = await Scholarship.aggregate([
      {
        $group: {
          _id: "$country",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          country: "$_id",
          count: 1,
        },
      },
    ]);

    res.status(200).json({
      totalUsers,
      totalProfiles,
      totalScholarships,
      scholarshipsByCountry,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
