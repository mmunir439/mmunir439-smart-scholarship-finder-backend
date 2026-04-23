const Scholarship = require("../models/scholarship");
//get all schoalrhips route in here
const getScholarships = async (req, res) => {
  try {
    const { country, degreeLevel, field } = req.query;

    let filter = {};

    if (country) filter.country = country;
    if (degreeLevel) filter.degreeLevel = degreeLevel;
    if (field) filter.fieldOfStudy = field;

    const data = await Scholarship.find(filter);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
const getScholarshipById = async (req, res) => {
  try {
    const data = await Scholarship.findById(req.params.id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
const createScholarship = async (req, res) => {
  try {
    const data = await Scholarship.create(req.body);

    res.status(201).json({
      success: true,
      message: "Created",
      data,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
const updateScholarship = async (req, res) => {
  try {
    const data = await Scholarship.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Updated",
      data,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
const deleteScholarship = async (req, res) => {
  try {
    const data = await Scholarship.findByIdAndDelete(req.params.id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Deleted",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports={getScholarships,deleteScholarship,updateScholarship,createScholarship,getScholarshipById}