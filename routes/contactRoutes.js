const express = require("express");
const {
  createContact,
  getAllContacts,
  updateContactStatus,
} = require("../controllers/contactController");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.post("/", protect, createContact);
router.get("/", getAllContacts);
router.patch("/:id/status", updateContactStatus);

module.exports = router;
