const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
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
router.get("/me", authMiddleware, getCurrentUser);

module.exports = router;
