require("dotenv").config();
const cors = require("cors");
const express = require("express");
const connectDB = require("./config/db");
const userRoutes = require("./routes/user");
const profileRoutes = require("./routes/profileRoutes");
const scholarshipRoutes = require("./routes/scholarshipRoutes");
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
app.get("/munir", (req, res) => {
  res.send(`server is runing on port ${port}`);
});
app.listen(port, () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});
