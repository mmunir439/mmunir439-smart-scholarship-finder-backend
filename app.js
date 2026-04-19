require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const studentRoutes = require("./routes/student");
const app = express();
// connect database
connectDB();
// Middleware
app.use(express.json());
const port = app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});
