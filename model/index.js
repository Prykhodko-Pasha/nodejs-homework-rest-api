const fs = require("fs/promises");
const contacts = require("./contacts.json");
const path = require("path");
const { nanoid } = require("nanoid");

const contactsPath = path.join(__dirname, "contacts.json");

const listContacts = async () => {
  return await contacts;
};

const getContactById = async (contactId) => {
  const contactsArr = await listContacts();
  return contactsArr.find((contact) => contact.id === contactId);
};

const addContact = async ({ name, email, phone }) => {
  const contactsArr = await listContacts();
  const newContact = {
    id: nanoid(),
    name,
    email,
    phone,
  };
  const newContacts = [...contactsArr, newContact];
  await updateProducts(newContacts);
  return newContact;
};

const removeContact = async (contactId) => {
  const contactsArr = await listContacts();
  const idx = contactsArr.findIndex((contact) => contact.id === contactId);
  if (idx === -1) return null;
  const deletedContact = contactsArr.splice(idx, 1);
  await updateProducts(contactsArr);
  return deletedContact;
};

const updateContact = async (contactId, { name, email, phone }) => {
  const contactsArr = await listContacts();
  const idx = contactsArr.findIndex((contact) => contact.id === contactId);
  if (idx === -1) return null;

  const {
    id,
    name: currName,
    email: currEmail,
    phone: currPhone,
  } = contactsArr[idx];
  const updName = name || currName;
  const updEmail = email || currEmail;
  const updPhone = phone || currPhone;
  contactsArr[idx] = {
    id,
    name: updName,
    email: updEmail,
    phone: updPhone,
  };

  await updateProducts(contactsArr);
  return contactsArr[idx];
};

const updateProducts = async (data) => {
  try {
    await fs.writeFile(contactsPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
