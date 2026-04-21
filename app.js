require("dotenv").config();
const cors = require("cors");
const express = require("express");
const connectDB = require("./config/db");
const userRoutes = require("./routes/user");
const profileRoutes = require("./routes/profileRoutes");
const scholarshipRoutes = require("./routes/scholarshipRoutes");
const lang = require("./routes/langRoutes");
const scrapeScholarships = require("./utils/scraper");
const matchRoutes = require("./routes/matchRoutes.js");
const app = express();
// connect database
connectDB();

app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  }),
);
// Middleware
app.use(express.json());
//port declaration
const port = process.env.PORT || 5000;
app.use("/user", userRoutes);
app.use("/profileRoutes", profileRoutes);
app.use("/scholarshipRoutes", scholarshipRoutes);
app.use("/matchRoutes", matchRoutes);
app.use("/lang", lang);
app.get("/munir", (req, res) => {
  res.send(`server is runing on port ${port}`);
});
app.listen(port, async () => {
  console.log(`Server running on port ${port}`);

  try {
    const result = await scrapeScholarships();
    console.log("Auto scrape result:", result);
  } catch (err) {
    console.log("Auto scrape failed:", err.message);
  }
});
