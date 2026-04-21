const jwt = require("jsonwebtoken");
const User = require("../models/user");

const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = header.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;

    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// ✅ NEW middleware
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Not authenticated",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admin only",
    });
  }

  next();
};

// ✅ EXPORT BOTH
module.exports = {
  protect,
  adminOnly,
};
