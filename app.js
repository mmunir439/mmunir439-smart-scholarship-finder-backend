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

const normalizeOrigin = (origin) =>
  typeof origin === "string" ? origin.replace(/\/$/, "") : origin;

const staticAllowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "https://smart-scholarship-finder-frontend.vercel.app",
  process.env.FRONTEND_URL,
]
  .filter(Boolean)
  .map(normalizeOrigin);

function isAllowedOrigin(origin) {
  if (!origin) return true;

  const normalized = normalizeOrigin(origin);

  if (staticAllowedOrigins.includes(normalized)) return true;

  // Vercel preview deployments for the frontend project
  if (
    /^https:\/\/smart-scholarship-finder-frontend[\w-]*\.vercel\.app$/.test(
      normalized,
    )
  ) {
    return true;
  }

  // Local dev on any port
  if (/^http:\/\/localhost:\d+$/.test(normalized)) return true;

  return false;
}

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    console.warn("CORS rejected origin:", origin);
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 204,
};

const app = express();

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());

if (isVercel) {
  app.use(async (req, res, next) => {
    try {
      await connectDB();
      next();
    } catch (error) {
      next(error);
    }
  });
}

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
  const origin = req.headers.origin;
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", normalizeOrigin(origin));
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal server error",
  });
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
