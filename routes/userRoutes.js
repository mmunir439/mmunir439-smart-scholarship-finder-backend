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
  verifyResetToken,
  resetPassword,
  getAllUsers,
  updateUser,
} = require("../controllers/userController");

// REGISTER route
router.post("/register", registerUser);

// LOGIN route
router.post("/login", loginUser);
router.delete("/delete/:id", protect, adminOnly, deleteUser);
router.get("/", protect, adminOnly, getAllUsers);
router.get("/all", protect, adminOnly, getAllUsers);
//get currentUser
router.get("/getCurrentUser", protect, getCurrentUser);
router.post("/forgot-password", forgotPassword);
router.get("/reset-password/:token", verifyResetToken);
router.post("/reset-password/:token", resetPassword);
router.put("/update", protect, updateUser);

module.exports = router;
