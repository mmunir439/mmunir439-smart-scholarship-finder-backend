const AcademicInformation = require("../models/academicModel");

// CREATE
const createAcademicprofile = async (req, res) => {
  try {
    const { cgpa, ielts, degreeLevel, field } = req.body;

    const newRecord = new AcademicInformation({
      cgpa,
      ielts,
      degreeLevel,
      field,
      userId: req.user._id,
    });

    await newRecord.save();

    res.status(201).json({
      success: true,
      message: "Academic information saved successfully",
      data: newRecord,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// READ ALL (for admin only user)
const getAllAcademicProfiles = async (req, res) => {
  try {
    const records = await AcademicInformation.find();
    // console.log(req.user);
    res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// READ SINGLE
const getMyAcademicProfile = async (req, res) => {
  try {
    const record = await AcademicInformation.findOne({
      userId: req.user._id,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Academic profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE
const updateMyAcademicProfile = async (req, res) => {
  try {
    const updatedRecord = await AcademicInformation.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true, runValidators: true },
    );

    if (!updatedRecord) {
      return res.status(404).json({
        success: false,
        message: "Academic profile not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Academic profile updated successfully",
      data: updatedRecord,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// DELETE
const deleteMyAcademicProfile = async (req, res) => {
  try {
    const deletedRecord = await AcademicInformation.findOneAndDelete({
      userId: req.user._id,
    });

    if (!deletedRecord) {
      return res.status(404).json({
        success: false,
        message: "Academic profile not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Academic profile deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createAcademicprofile,
  getAllAcademicProfiles,
  getMyAcademicProfile,
  updateMyAcademicProfile,
  deleteMyAcademicProfile,
};
