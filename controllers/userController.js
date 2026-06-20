const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const academicInformationSchema = require("../models/academicModel.js");
const createTransporter = require("../utils/mailer");
const crypto = require("crypto");
const registerUser = async (req, res) => {
  try {
    let { name, email, password, role } = req.body;

    name = typeof name === "string" ? name.trim() : "";
    email = typeof email === "string" ? email.toLowerCase().trim() : "";
    password = typeof password === "string" ? password.trim() : "";

    const nameRegex = /^[A-Za-z]+([ '-][A-Za-z]+)*$/;
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

    if (!nameRegex.test(name)) {
      return res.status(400).json({ field: "name", message: "Invalid name" });
    }

    if (!emailRegex.test(email) || email.includes("..")) {
      return res.status(400).json({
        field: "email",
        message: "Invalid email address",
      });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        field: "password",
        message:
          "Password must contain uppercase, lowercase, number and one special Character",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        field: "email",
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "student",
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
// LOGIN
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    if (!email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // ✅ Add role inside the token
    const token = jwt.sign(
      { id: user._id, role: user.role }, // 👈 role added here
      process.env.JWT,
      { expiresIn: "1d" },
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role, // 👈 also return role in response
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// delete user by id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await academicInformationSchema.findOneAndDelete({ userId: user._id });
    await user.deleteOne();

    res.status(200).json({ message: "User and profile deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//get currentuser
const getCurrentUser = async (req, res) => {
  console.log("USER:", req.user); // 👈 add this

  try {
    res.status(200).json(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
const RESET_TOKEN_EXPIRY_MS = 3600000; // 1 hour

const hashResetToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const forgotPassword = async (req, res) => {
  const genericMessage =
    "IWe sent reset instructions to learncodewithmunir@gmail.com. Check your inbox and spam folder.";

  try {
    const email =
      typeof req.body.email === "string"
        ? req.body.email.toLowerCase().trim()
        : "";

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email) || email.includes("..")) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: genericMessage });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = hashResetToken(token);
    user.resetPasswordExpires = Date.now() + RESET_TOKEN_EXPIRY_MS;
    await user.save();

    const frontendUrl =
      process.env.FRONTEND_URL || "http://localhost:3001";
    const resetLink = `${frontendUrl}/reset-password/${token}`;

    const transporter = await createTransporter();

    await transporter.sendMail({
      from: `"Smart Scholarship" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset",
      html: `
        <h2>Password Reset</h2>
        <p>Click below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link expires in 1 hour.</p>
        <p>If you did not request this, you can ignore this email.</p>
      `,
    });

    res.status(200).json({ message: genericMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to send password reset email" });
  }
};

const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ valid: false, message: "Token is required" });
    }

    const user = await User.findOne({
      resetPasswordToken: hashResetToken(token),
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ valid: false, message: "Invalid or expired token" });
    }

    res.status(200).json({ valid: true, message: "Token is valid" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const rawPassword = req.body.password || req.body.newPassword;
    const password =
      typeof rawPassword === "string" ? rawPassword.trim() : "";

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        field: "password",
        message:
          "Password must contain uppercase, lowercase, number and be at least 6 chars",
      });
    }

    const user = await User.findOne({
      resetPasswordToken: hashResetToken(token),
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
// ...existing code...
const updateUser = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, email, password } = req.body;
    const updates = {};

    if (typeof name === "string") {
      const nameVal = name.trim();
      const nameRegex = /^[A-Za-z]+([ '-][A-Za-z]+)*$/;
      if (!nameRegex.test(nameVal)) {
        return res.status(400).json({ field: "name", message: "Invalid name" });
      }
      updates.name = nameVal;
    }

    if (typeof email === "string") {
      const emailVal = email.toLowerCase().trim();
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

      if (!emailRegex.test(emailVal) || emailVal.includes("..")) {
        return res
          .status(400)
          .json({ field: "email", message: "Invalid email" });
      }

      // only check if email is actually changing
      if (emailVal !== currentUser.email) {
        const existing = await User.findOne({
          email: emailVal,
          _id: { $ne: userId },
        });

        if (existing) {
          return res
            .status(400)
            .json({ field: "email", message: "Email already in use" });
        }
      }

      updates.email = emailVal;
    }

    if (typeof password === "string" && password.trim() !== "") {
      const passwordVal = password.trim();
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

      if (!passwordRegex.test(passwordVal)) {
        return res.status(400).json({
          field: "password",
          message:
            "Password must contain uppercase, lowercase, number and be at least 6 chars",
        });
      }

      updates.password = await bcrypt.hash(passwordVal, 10);
    }

    const updated = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    }).select("-password -resetPasswordToken -resetPasswordExpires");

    return res.status(200).json({
      message: "Profile updated",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  deleteUser,
  getAllUsers,
  forgotPassword,
  verifyResetToken,
  updateUser,
  resetPassword,
};
