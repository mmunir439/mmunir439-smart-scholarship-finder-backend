const AcademicInformation = require("../models/academic");

const createAcademicprofile = async (req, res) => {
  try {
    const { cgpa, ielts, degreeLevel, field } = req.body;

    const newRecord = new AcademicInformation({
      cgpa,
      ielts,
      degreeLevel,
      field,
      userId: req.user._id, // don't forget this if required
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

module.exports = createAcademicprofile;
