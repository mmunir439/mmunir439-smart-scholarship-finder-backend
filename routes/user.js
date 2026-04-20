const express = require("express");
const router = express.Router();

const { registerUser, loginUser } = require("../controllers/user");

// REGISTER route
router.post("/register", registerUser);

// LOGIN route
router.post("/login", loginUser);

module.exports = router;
