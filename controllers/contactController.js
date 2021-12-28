const {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
} = require("../model/index");

const Joi = require("joi");

const schemaAdd = Joi.object({
  name: Joi.string().required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
    })
    .required(),
  phone: Joi.string().required(),
});
const schemaUpdate = Joi.object({
  name: Joi.string(),
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net"] },
  }),
  phone: Joi.string(),
}).min(1);

const getAllContacts = async (_, res, next) => {
  try {
    const contacts = await listContacts();
    res.json(contacts);
  } catch (err) {
    next(err);
  }
};

const getContact = async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const contact = await getContactById(contactId);
    if (!contact) {
      const err = new Error("Not found");
      err.status = 404;
      throw err;
    }
    res.json(contact);
  } catch (err) {
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
    const contact = await addContact(req.body);
    res.status(201).json(contact);
  } catch (err) {
    next(err);
  }
};

const deleteContact = async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const contact = await removeContact(contactId);
    if (!contact) {
      const err = new Error("Not found");
      err.status = 404;
      throw err;
    }
    res.json({ message: "contact deleted" });
  } catch (err) {
    next(err);
  }
};

const patchContact = async (req, res, next) => {
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
    const contact = await updateContact(contactId, req.body);
    if (!contact) {
      const err = new Error("Not found");
      err.status = 404;
      throw err;
    }
    res.json(contact);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllContacts,
  getContact,
  postContact,
  deleteContact,
  patchContact,
};
