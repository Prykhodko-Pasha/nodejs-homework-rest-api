const {
  Contact,
  schemaAdd,
  schemaUpdate,
  schemaUpdateStatus,
} = require("../model/contact");

const getAllContacts = async (_, res, next) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (err) {
    next(err);
  }
};

const getContact = async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const contact = await Contact.findById(contactId);
    if (!contact) {
      const err = new Error("Not found");
      err.status = 404;
      throw err;
    }
    res.json(contact);
  } catch (err) {
    if (err.message.includes("Cast to ObjectId failed")) {
      err.status = 404;
    }
    next(err);
  }
};

const postContact = async (req, res, next) => {
  try {
    const { error } = schemaAdd.validate(req.body);
    if (error) {
      const err = new Error(
        "missing required name field or input data is invalid"
      );
      err.status = 400;
      throw err;
    }
    const contact = await Contact.create(req.body);
    res.status(201).json(contact);
  } catch (err) {
    if (err.message.includes("validation failed")) {
      err.status = 400;
    }
    next(err);
  }
};

const deleteContact = async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const contact = await Contact.findByIdAndDelete(contactId);
    if (!contact) {
      const err = new Error("Not found");
      err.status = 404;
      throw err;
    }
    res.json({ message: "contact deleted" });
  } catch (err) {
    if (err.message.includes("Cast to ObjectId failed")) {
      err.status = 404;
    }
    next(err);
  }
};

const updateContact = async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const { error } = schemaUpdate.validate(req.body);
    if (error) {
      const err = new Error(
        "missing required name field or input data is invalid"
      );
      err.status = 400;
      throw err;
    }
    const contact = await Contact.findByIdAndUpdate(contactId, req.body, {
      new: true,
    });
    if (!contact) {
      const err = new Error("Not found");
      err.status = 404;
      throw err;
    }
    res.json(contact);
  } catch (err) {
    if (err.message.includes("Cast to ObjectId failed")) {
      err.status = 404;
    }
    if (err.message.includes("validation failed")) {
      err.status = 400;
    }
    next(err);
  }
};

const updateStatusContact = async (req, res, next) => {
  const { contactId } = req.params;
  const { favorite } = req.body;
  try {
    const { error } = schemaUpdateStatus.validate(req.body);
    if (error) {
      const err = new Error(
        "missing required name field or input data is invalid"
      );
      err.status = 400;
      throw err;
    }
    const contact = await Contact.findByIdAndUpdate(
      contactId,
      { favorite },
      {
        new: true,
      }
    );
    if (!contact) {
      const err = new Error("Not found");
      err.status = 404;
      throw err;
    }
    res.json(contact);
  } catch (err) {
    if (err.message.includes("Cast to ObjectId failed")) {
      err.status = 404;
    }
    if (err.message.includes("validation failed")) {
      err.status = 400;
    }
    next(err);
  }
};

module.exports = {
  getAllContacts,
  getContact,
  postContact,
  deleteContact,
  updateContact,
  updateStatusContact,
};
