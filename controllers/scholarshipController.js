const Scholarship = require("../models/scholarshipModel");

// ==============================
// 1. GET ALL SCHOLARSHIPS
// ==============================
const getAllScholarships = async (req, res) => {
  try {
    const scholarships = await Scholarship.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: scholarships.length,
      data: scholarships,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// 2. GET SCHOLARSHIPS WITH FILTERS
// ==============================
const getScholarships = async (req, res) => {
  try {
    const { country, degreeLevel, field, minCGPA } = req.query;

    let filter = {};

    if (country) filter.country = country;
    if (degreeLevel) filter.degreeLevel = degreeLevel;
    if (field) filter.field = field;
    if (minCGPA) filter.minCGPA = { $lte: Number(minCGPA) };

    const scholarships = await Scholarship.find(filter).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: scholarships.length,
      data: scholarships,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// 3. GET SINGLE SCHOLARSHIP
// ==============================
const getScholarshipById = async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: "Scholarship not found",
      });
    }

    res.status(200).json({
      success: true,
      data: scholarship,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// 4. CREATE SCHOLARSHIP
// ==============================
const createScholarship = async (req, res) => {
  try {
    const { name, country, degreeLevel, field, deadline, link, source } =
      req.body;

    // Basic validation
    if (
      !name ||
      !country ||
      !degreeLevel ||
      !field ||
      !deadline ||
      !link ||
      !source
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
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
    res.status(400).json({
      success: false,
      message: error.message,
    });
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
      { new: true, runValidators: true },
    );

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: "Scholarship not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Scholarship updated successfully",
      data: scholarship,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// 6. DELETE SCHOLARSHIP
// ==============================
const deleteScholarship = async (req, res) => {
  try {
    const scholarship = await Scholarship.findByIdAndDelete(req.params.id);

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: "Scholarship not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Scholarship deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// EXPORT ALL CONTROLLERS
// ==============================
module.exports = {
  getAllScholarships,
  getScholarships,
  getScholarshipById,
  createScholarship,
  updateScholarship,
  deleteScholarship,
};
