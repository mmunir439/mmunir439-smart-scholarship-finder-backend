require("dotenv").config();
const cors = require("cors");
const express = require("express");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes.js");
const academicRoutes = require("./routes/acadmicRoutes.js");
const eligibilityRoutes = require("./routes/eligibilityRoutes");
const { protect, adminOnly } = require("./middleware/auth.js");
const { startScheduler } = require("./scrapers/scheduler");
const scholarhispRoutes = require("./routes/scholarshipRoutes.js");
const app = express();

app.use(cors({ origin: "http://localhost:3001", credentials: true }));
app.use(express.json());

const port = process.env.PORT || 5000;

app.use("/user", userRoutes);
app.use("/academic", academicRoutes);
app.use("/scholarship", scholarhispRoutes);
app.use("/eligible", eligibilityRoutes);
app.get("/munir", (req, res) => {
  res.send(`server is running on port ${port}`);
});

// Connect DB first, then start server + scraper
connectDB().then(async () => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
  await startScheduler();
});

module.exports = app;
