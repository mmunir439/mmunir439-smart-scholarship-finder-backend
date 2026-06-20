const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// ─────────────────────────────────────────
// GET /user/settings
// Get current student settings
// ─────────────────────────────────────────
const getSettings = async (req, res) => {
  try {
    // req.user._id comes from your existing protect middleware
    const user = await User.findById(req.user._id).select(
      "-password -resetPasswordToken -resetPasswordExpires",
    );

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────
// PUT /user/settings/profile
// Update student name
// ─────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Name cannot be empty" });
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { name},
      { new: true },
    ).select("-password");

    res
      .status(200)
      .json({ success: true, message: "User Name is updated Successfully", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────
// PUT /user/settings/change-password
// Change student password
// ─────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Get user WITH password
    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Old password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────
// PUT /user/settings/accessibility
// Update language and text-to-speech
// ─────────────────────────────────────────
const updateAccessibility = async (req, res) => {
  try {
    const { language, textToSpeech } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { language, textToSpeech },
      { new: true },
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Accessibility settings updated",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────
// PUT /user/settings/notifications
// Update notification preferences
// ─────────────────────────────────────────
const updateNotifications = async (req, res) => {
  try {
    const { emailNotifications, eligibilityAlerts } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { emailNotifications, eligibilityAlerts },
      { new: true },
    ).select("-password");

    res
      .status(200)
      .json({ success: true, message: "Notifications updated", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────
// DELETE /user/settings/delete-account
// Delete student account
// ─────────────────────────────────────────
const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res
      .status(200)
      .json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSettings,
  updateProfile,
  changePassword,
  updateAccessibility,
  updateNotifications,
  deleteAccount,
};
