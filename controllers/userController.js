const jwt = require("jsonwebtoken");
const { User, joiSchemaUser, joiSchemaUserSubs } = require("../model/user");

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
      email,
      subscription: result.subscription,
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
    res.json({
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
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: null });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const getCurrentUser = async (req, res) => {
  const { email, subscription } = req.user;
  res.json({
    user: {
      email,
      subscription,
    },
  });
};

const updateUserSubscription = async (req, res, next) => {
  try {
    const { _id, email } = req.user;
    const { subscription } = req.body;
    const { error } = joiSchemaUserSubs.validate(req.body);
    if (error)
      return res.status(400).json({
        message: error.details[0].message,
      });
    await User.findByIdAndUpdate(_id, { subscription });
    res.json({
      email,
      subscription,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateUserSubscription,
};
