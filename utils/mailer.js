const nodemailer = require("nodemailer");

const createTransporter = async () => {
  console.log("📧 Creating transporter...");
  console.log("USER:", process.env.EMAIL_USER);
  console.log("PASS:", process.env.EMAIL_PASS ? "Loaded ✅" : "Missing ❌");

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

module.exports = createTransporter;
