const express = require("express");
const router = express.Router();
const contactController = require("../../controllers/contactController");

router.get("/", contactController.getAllContacts);

router.get("/:contactId", contactController.getContact);

router.post("/", contactController.postContact);

router.delete("/:contactId", contactController.deleteContact);

router.patch("/:contactId", contactController.patchContact);

module.exports = router;
