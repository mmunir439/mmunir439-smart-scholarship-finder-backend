const express = require("express");
const router = express.Router();
const { adminOnly } = require("../middleware/auth");
const { protect } = require("../middleware/auth");
const {
  registerUser,
  loginUser,
  getCurrentUser,
  deleteUser,
  getAllUsers,
} = require("../controllers/userController");

// REGISTER route
router.post("/register", registerUser);

// LOGIN route
router.post("/login", loginUser);
router.delete("/delete/:id", protect, adminOnly, deleteUser);
router.get("/all", protect, adminOnly, getAllUsers);
//get currentUser
router.get("/getCurrentUser", protect, getCurrentUser);

module.exports = router;
