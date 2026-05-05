const Contact = require("../models/contactModel");

const createContact = async (req, res) => {
  try {
    let { name, email, subject, message } = req.body;

    name = typeof name === "string" ? name.trim() : "";
    email = typeof email === "string" ? email.toLowerCase().trim() : "";
    subject = typeof subject === "string" ? subject.trim() : "";
    message = typeof message === "string" ? message.trim() : "";

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    if (message.length < 10) {
      return res.status(400).json({ message: "Message must be at least 10 characters" });
    }

    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
    });

    res.status(201).json({
      message: "Your message has been sent successfully",
      data: contact,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ data: contacts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ message: "Contact message not found" });
    }

    res.status(200).json({
      message: "Contact status updated successfully",
      data: contact,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createContact,
  getAllContacts,
  updateContactStatus,
};