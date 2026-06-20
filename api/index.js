const app = require("../app");
const connectDB = require("../config/db");

module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error("Serverless handler error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error — check MONGO_URI and Atlas Network Access (allow 0.0.0.0/0 for Vercel)",
    });
  }
};
