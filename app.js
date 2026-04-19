require("dotenv").config();
const express = require("express");
const user
const connectDB = require("./config/db");
const app = express();
// connect database
connectDB();
const port = app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});
