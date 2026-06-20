const Scholarship = require("../models/scholarshipModel");
const { filterScholarships } = require("../services/scholarshipFilterService");

function applyGuidanceFilters(scholarships, query) {
  const { studyRegion, preferredDegree } = query;
  if (!studyRegion && !preferredDegree) return scholarships;

  return filterScholarships(scholarships, {
    studyRegion: studyRegion || "USA & Europe",
    preferredDegree: preferredDegree || "All",
  });
}

// ==============================
// 1. GET ALL SCHOLARSHIPS
// ==============================
const getAllScholarships = async (req, res) => {
  try {
    let scholarships = await Scholarship.find().sort({ createdAt: -1 });
    scholarships = applyGuidanceFilters(scholarships, req.query);

    res.status(200).json({
      success: true,
      total: scholarships.length,
      data: scholarships,
      filters: {
        studyRegion: req.query.studyRegion || null,
        preferredDegree: req.query.preferredDegree || null,
      },
    });
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

    if (minCGPA) {
      filter.$or = [
        { minCGPA: { $lte: Number(minCGPA) } },
        { minCGPA: null },
      ];
    }

    if (maxIELTS) {
      filter.$or = [
        ...(filter.$or || []),
        { ielts: { $lte: Number(maxIELTS) } },
        { ielts: null },
      ];
    }

    let scholarships = await Scholarship.find(filter).sort({ createdAt: -1 });
    scholarships = applyGuidanceFilters(scholarships, req.query);

    res.status(200).json({
      success: true,
      count: scholarships.length,
      data: scholarships,
      filters: {
        studyRegion: req.query.studyRegion || null,
        preferredDegree: req.query.preferredDegree || null,
      },
    });
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
