const jwt = require("jsonwebtoken");
const { User, joiSchemaUser } = require("../model/user");

const { SECRET_KEY } = process.env;

const registerUser = async (req, res, next) => {
  try {
    const { error } = joiSchemaUser.validate(req.body);
    if (error)
      return res.status(400).json({
        message: error.details[0].message,
      });

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user)
      return res.status(409).json({
        message: "Email in use",
      });

    const newUser = new User(req.body);
    newUser.setPassword(password);
    const result = await newUser.save();
    res.status(201).json({
      user: {
        email: result.email,
        subscription: result.subscription,
      },
    });
  } catch (err) {
    next(err);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { error } = joiSchemaUser.validate(req.body);
    if (error)
      return res.status(400).json({
        message: error.details[0].message,
      });

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.comparePassword(password))
      return res.status(401).json({
        message: "Email or password is wrong",
      });

    const { _id, subscription } = user;
    const payload = { id: _id };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "24h" });
    await User.findByIdAndUpdate(_id, { token });
    res.status(200).json({
      token,
      user: {
        email,
        subscription,
      },
    });
  } catch (err) {
    next(err);
  }
};

const logoutUser = async (req, res, next) => {
  try {
    const { error } = joiSchemaUser.validate(req.body);
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

const getCurrentUser = async (req, res, next) => {
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

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
};
