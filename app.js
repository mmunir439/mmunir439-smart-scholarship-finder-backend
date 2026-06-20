require("dotenv").config();
const cors = require("cors");
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS length:", process.env.EMAIL_PASS?.length);
const express = require("express");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes.js");
const academicRoutes = require("./routes/acadmicRoutes.js");
const eligibilityRoutes = require("./routes/eligibilityRoutes");
const { protect, adminOnly } = require("./middleware/auth.js");
const settingsRoutes = require("./routes/settingsRoutes");
const { startScheduler } = require("./scrapers/scheduler");
const scholarhispRoutes = require("./routes/scholarshipRoutes.js");
const contactRoutes = require("./routes/contactRoutes");

const app = express();

app.use(cors({ origin: "https://smart-scholarship-finder-frontend.vercel.app/", credentials: true }));
app.use(express.json());

const port = process.env.PORT || 5000;

app.use("/user", userRoutes);
app.use("/academic", academicRoutes);
app.use("/scholarship", scholarhispRoutes);
app.use("/eligible", eligibilityRoutes);
app.use("/user/settings", settingsRoutes);
app.use("/contact", contactRoutes);
app.get("/", (req, res) => {
  res.send(`server is running on port ${port}`);
});

// Connect DB, start server, run scraper in background
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    startScheduler();
  });
});

module.exports = app;
