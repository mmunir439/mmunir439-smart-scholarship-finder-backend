const Scholarship = require("../models/scholarshipModel");

// ==============================
// 1. GET ALL SCHOLARSHIPS
// ==============================
const getAllScholarships = async (req, res) => {
  try {
    const scholarships = await Scholarship.find().sort({ createdAt: -1 });
    console.log("FIRST DOC:", scholarships[0]); // 👈 ADD THIS

    res
      .status(200)
      .json({ success: true, total: scholarships.length, data: scholarships });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================
// 2. GET SCHOLARSHIPS WITH FILTERS
// ==============================
const getScholarships = async (req, res) => {
  try {
    const { country, degreeLevel, field, minCGPA, maxIELTS } = req.query;

    let filter = {};
    if (country) filter.country = country;
    if (degreeLevel) filter.degreeLevel = degreeLevel;
    if (field) filter.field = field;

    // minCGPA filter: return scholarships where the required CGPA
    // is less than or equal to what the student has
    // e.g. student has 3.2 → show scholarships requiring ≤ 3.2
    if (minCGPA) {
      filter.$or = [
        { minCGPA: { $lte: Number(minCGPA) } },
        { minCGPA: null }, // also include scholarships with no CGPA listed
      ];
    }

    // maxIELTS filter: return scholarships the student qualifies for
    // e.g. student has 6.5 → show scholarships requiring ≤ 6.5
    if (maxIELTS) {
      filter.$or = [
        ...(filter.$or || []),
        { ielts: { $lte: Number(maxIELTS) } },
        { ielts: null },
      ];
    }

    const scholarships = await Scholarship.find(filter).sort({ createdAt: -1 });
    res
      .status(200)
      .json({ success: true, count: scholarships.length, data: scholarships });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ==============================
// 3. GET SINGLE SCHOLARSHIP
// ==============================
const getScholarshipById = async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);
    if (!scholarship) {
      return res
        .status(404)
        .json({ success: false, message: "Scholarship not found" });
    }
    res.status(200).json({ success: true, data: scholarship });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ==============================
// 4. CREATE SCHOLARSHIP
// ==============================
const createScholarship = async (req, res) => {
  try {
    const { name, country, degreeLevel, field, deadline, link, source } =
      req.body;
    if (
      !name ||
      !country ||
      !degreeLevel ||
      !field ||
      !deadline ||
      !link ||
      !source
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }
    const scholarship = await Scholarship.create({
      ...req.body,
      addedBy: "admin",
    });
    res.status(201).json({
      success: true,
      message: "Scholarship created successfully",
      data: scholarship,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ==============================
// 5. UPDATE SCHOLARSHIP
// ==============================
const updateScholarship = async (req, res) => {
  try {
    const scholarship = await Scholarship.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!scholarship) {
      return res
        .status(404)
        .json({ success: false, message: "Scholarship not found" });
    }
    res.status(200).json({
      success: true,
      message: "Scholarship updated successfully",
      data: scholarship,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ==============================
// 6. DELETE SCHOLARSHIP
// ==============================
const deleteScholarship = async (req, res) => {
  try {
    const scholarship = await Scholarship.findByIdAndDelete(req.params.id);
    if (!scholarship) {
      return res
        .status(404)
        .json({ success: false, message: "Scholarship not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Scholarship deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllScholarships,
  getScholarships,
  getScholarshipById,
  createScholarship,
  updateScholarship,
  deleteScholarship,
};
