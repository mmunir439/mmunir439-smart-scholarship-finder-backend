const Scholarship = require("../models/Scholarship");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
// Add Scholarship
const createScholarship = async (req, res) => {
  try {
    const { name, country, degree, minCGPA, minIELTS } = req.body;

    const scholarship = await Scholarship.create({
      name,
      country,
      degree,
      minCGPA,
      minIELTS,
    });

    res.status(201).json(scholarship);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Scholarships
const getAllScholarships = async (req, res) => {
  try {
    const data = await Scholarship.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Check Eligibility
const checkEligibility = async (req, res) => {
  try {
    console.log("REQ USER:", req.user);
    const user = req.user; // ✅ logged-in user

    if (!user || !user.studentProfile) {
      return res.status(400).json({
        message: "User or student profile not found",
      });
    }

    const profile = user.studentProfile;

    const scholarships = await Scholarship.find();

    const results = scholarships.map((s) => {
      // ✅ normalize function
      const normalizeDegree = (degree) => {
        degree = degree.toLowerCase();

        if (degree === "bs" || degree === "bachelor") return "bachelor";
        if (degree === "ms" || degree === "master" || degree === "masters")
          return "master";
        if (degree === "phd") return "phd";

        return degree;
      };

      // ✅ normalize values
      const userDegree = normalizeDegree(profile.degreeLevel);
      const scholarshipDegree = normalizeDegree(s.degree);

      // ✅ default status
      let status = "Not Eligible";

      // ✅ decision logic
      if (userDegree === scholarshipDegree) {
        if (profile.cgpa >= s.minCGPA) {
          if (profile.ielts >= s.minIELTS) {
            status = "Eligible";
          } else {
            status = "Partially Eligible";
          }
        }
      }

      return {
        scholarship: s.name,
        status,
      };
    });

    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createScholarship,
  getAllScholarships,
  checkEligibility,
};
