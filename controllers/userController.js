const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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

    await StudentProfile.findOneAndDelete({ userId: user._id });
    await user.deleteOne();

    res.status(200).json({ message: "User and profile deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  deleteUser,
};
