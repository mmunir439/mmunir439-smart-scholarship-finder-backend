require("dotenv").config();
const cors = require("cors");
const express = require("express");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes.js");
const academicRoutes = require("./routes/acadmicRoutes.js");
const eligibilityRoutes = require("./routes/eligibilityRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const scholarhispRoutes = require("./routes/scholarshipRoutes.js");
const contactRoutes = require("./routes/contactRoutes");

const isVercel = process.env.VERCEL === "1";

const allowedOrigins = [
  process.env.FRONTEND_URL,
]
  .filter(Boolean)
  .map((origin) => origin.replace(/\/$/, ""));

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(express.json());

const port = process.env.PORT || 5000;

app.use("/user", userRoutes);
app.use("/academic", academicRoutes);
app.use("/scholarship", scholarhispRoutes);
app.use("/eligible", eligibilityRoutes);
app.use("/user/settings", settingsRoutes);
app.use("/contact", contactRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Smart Scholarship API is running",
    environment: isVercel ? "vercel" : "local",
  });
});

app.use((err, req, res, next) => {
  if (err.message?.startsWith("CORS blocked")) {
    return res.status(403).json({ success: false, message: err.message });
  }
  next(err);
});

if (!isVercel) {
  connectDB()
    .then(() => {
      app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
        const { startScheduler } = require("./scrapers/scheduler");
        startScheduler();
      });
    })
    .catch((error) => {
      console.error("Failed to start server:", error.message);
      process.exit(1);
    });
}

module.exports = app;
