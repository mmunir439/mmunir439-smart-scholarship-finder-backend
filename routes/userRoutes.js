const express = require("express");
const router = express.Router();
const { adminOnly } = require("../middleware/auth");
const { protect } = require("../middleware/auth");
const {
  registerUser,
  loginUser,
  getCurrentUser,
  deleteUser,
  forgotPassword,
  resetPassword,
  getAllUsers,
  updateUser,
} = require("../controllers/userController");

// REGISTER route
router.post("/register", registerUser);

// LOGIN getAllUsers
router.post("/login", loginUser);
router.delete("/delete/:id", protect, adminOnly, deleteUser);
router.get("/", protect, adminOnly, getAllUsers);
//get currentUser
router.get("/getCurrentUser", protect, getCurrentUser);
router.post("/forgot-password", forgotPassword);
router.put("/update", protect, updateUser);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
