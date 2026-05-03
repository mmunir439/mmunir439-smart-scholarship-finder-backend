const express = require("express");
const router = express.Router();
const { adminOnly } = require("../middleware/auth");
const { protect } = require("../middleware/auth");
const {
  registerUser,
  loginUser,
  getCurrentUser,
  deleteUser,
} = require("../controllers/userController");

// REGISTER route
router.post("/register", registerUser);

// LOGIN route
router.post("/login", loginUser);
router.delete("/delete/:id", protect, adminOnly, deleteUser);
//get currentUser
router.get("/getCurrentUser", protect, getCurrentUser);

module.exports = router;
