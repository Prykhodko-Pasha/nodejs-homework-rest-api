const {
  Contact,
  schemaAdd,
  schemaUpdate,
  schemaUpdateStatus,
} = require("../model/contact");

const getAllContacts = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const { page = 1, limit = 20, favorite } = req.query;
    let contacts = [];
    if (favorite) {
      contacts = await Contact.find({ owner: _id, favorite });
    } else {
      contacts = await Contact.find({ owner: _id }, "", {
        skip: (page - 1) * limit,
        limit: Number(limit),
      });
    }
    res.json(contacts);
  } catch (err) {
    next(err);
  }
};

const getContact = async (req, res, next) => {
  const { contactId } = req.params;
  const { _id } = req.user;
  try {
    const contact = await Contact.findById(contactId);
    if (!contact || !contact.owner.equals(_id)) {
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

    const { _id } = req.user;
    const contact = await Contact.create({ ...req.body, owner: _id });
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
  const { _id } = req.user;
  try {
    const contact = await Contact.findById(contactId);
    if (!contact || !contact.owner.equals(_id))
      return res.status(404).json({
        message: "Not found",
      });
    await Contact.findByIdAndDelete(contactId);
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
  const { _id } = req.user;
  try {
    const { error } = schemaUpdate.validate(req.body);
    if (error) {
      const err = new Error(
        "missing required name field or input data is invalid"
      );
      err.status = 400;
      throw err;
    }
    const contact = await Contact.findById(contactId);
    if (!contact || !contact.owner.equals(_id))
      return res.status(404).json({
        message: "Not found",
      });
    const updatedContact = await Contact.findByIdAndUpdate(
      contactId,
      req.body,
      {
        new: true,
      }
    );
    res.json(updatedContact);
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
  const { _id } = req.user;
  try {
    const { error } = schemaUpdateStatus.validate(req.body);
    if (error) {
      const err = new Error(
        "missing required name field or input data is invalid"
      );
      err.status = 400;
      throw err;
    }
    const contact = await Contact.findById(contactId);
    if (!contact || !contact.owner.equals(_id))
      return res.status(404).json({
        message: "Not found",
      });
    const updatedContact = await Contact.findByIdAndUpdate(
      contactId,
      { favorite },
      {
        new: true,
      }
    );
    res.json(updatedContact);
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
