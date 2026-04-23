const AcademicInformation = require("../models/academicinformation");

const academicinformation = async (req, res) => {
  try {
    const { cgpa, ielts, degreeLevel, field } = req.body;

    const newRecord = new AcademicInformation({
      cgpa,
      ielts,
      degreeLevel,
      field,
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

module.exports = academicinformation;
