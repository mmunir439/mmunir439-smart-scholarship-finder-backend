const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  registerUser,
  loginUser,
  getCurrentUser,
} = require("../controllers/user");

// REGISTER route
router.post("/register", registerUser);

// LOGIN route
router.post("/login", loginUser);
//get currentUser
router.get("/me", protect, getCurrentUser);

module.exports = router;
