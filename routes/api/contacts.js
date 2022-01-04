const express = require("express");
const router = express.Router();
const contactController = require("../../controllers/contactController");
const { authenticate } = require("../../middlewares/auth");

router.get("/", authenticate, contactController.getAllContacts);

router.get("/:contactId", authenticate, contactController.getContact);

router.post("/", authenticate, contactController.postContact);

router.delete("/:contactId", authenticate, contactController.deleteContact);

router.patch("/:contactId", authenticate, contactController.updateContact);

router.patch(
  "/:contactId/favorite",
  authenticate,
  contactController.updateStatusContact
);

module.exports = router;
