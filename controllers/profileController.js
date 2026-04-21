const StudentProfile = require("../models/StudentProfile");

exports.createOrUpdateProfile = async (req, res) => {
  try {
    const { cgpa, ieltsScore, degreeLevel, fieldOfStudy, targetCountry } =
      req.body;

    const profile = await StudentProfile.findOneAndUpdate(
      { userId: req.user._id }, // find by logged-in user
      {
        cgpa,
        ieltsScore,
        degreeLevel,
        fieldOfStudy,
        targetCountry,
      },
      {
        new: true, // return updated doc
        upsert: true, // create if not exists
        runValidators: true,
      },
    );

    res.status(200).json({
      success: true,
      message: "Profile saved successfully",
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
//get profle
exports.getProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({
      userId: req.user._id,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateLanguage = async (req, res) => {
  try {
    const { language } = req.body;

    if (!["en", "ur"].includes(language)) {
      return res.status(400).json({
        success: false,
        message: "Invalid language",
      });
    }

    const profile = await StudentProfile.findOneAndUpdate(
      { userId: req.user._id },
      { preferredLanguage: language },
      { new: true },
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Language updated successfully",
      data: profile,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
