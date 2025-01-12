const jwt = require("jsonwebtoken");
const fs = require("fs/promises");
const jimp = require("jimp");
const path = require("path");
const sendEmail = require("../helpers/sendEmail");
const {
  User,
  joiSchemaUser,
  joiSchemaUserSubs,
  joiSchemaUserVerif,
} = require("../model/user");

const { SECRET_KEY, PORT = 3000 } = process.env;
const BASE_URL = `http://localhost:${PORT}/api`;
const avatarsDir = path.join(__dirname, "../", "public/avatars");

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
    newUser.generateAvatar(email);
    newUser.generateVerifToken();
    const result = await newUser.save();

    const { verificationToken, subscription } = result;
    const data = {
      to: email,
      subject: "Verifying new email GoIT-HW",
      html: `<h1>Email Confirmation</h1>
             <p>Thank you for subscribing!</p>
             <p>Please confirm your email by clicking on the following link: </p>
             <a href="${BASE_URL}/users/verify/${verificationToken}">Click here</a>`,
    };
    sendEmail(data);

    res.status(201).json({
      email,
      subscription: subscription,
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
    if (!user.verify)
      return res.status(403).json({
        message: "Email is not verified",
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

const updateUserAvatar = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const { path: tempUpload, filename } = req.file;

    await jimp.read(tempUpload).then((resizeAvatar) => {
      return resizeAvatar.resize(250, 250).write(tempUpload);
    });

    const extension = filename.split(".").pop();
    const newFilename = `avatar-${Date.now()}.${extension}`;
    const fileUpload = path.join(avatarsDir, newFilename);

    await fs.rename(tempUpload, fileUpload);
    const avatarURL = path.join("avatars", newFilename);
    await User.findByIdAndUpdate(_id, { avatarURL });
    res.json({ avatarURL });
  } catch (err) {
    next(err);
  }
};

const verifyUserEmail = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });
    if (!user)
      return res.status(404).json({
        message: "User token not found",
      });

    const { _id } = user;
    await User.findByIdAndUpdate(_id, {
      verify: true,
      verificationToken: null,
    });

    res.json({
      message: "Verification successful",
    });
  } catch (err) {
    next(err);
  }
};

const sendVerifLetter = async (req, res, next) => {
  try {
    const { error } = joiSchemaUserVerif.validate(req.body);
    if (error)
      return res.status(400).json({
        message: error.details[0].message,
      });

    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({
        message: "User not found",
      });

    const { verificationToken, verify } = user;
    if (verify)
      return res.status(400).json({
        message: "Verification has already been passed",
      });

    const data = {
      to: email,
      subject: "Verifying new email GoIT-HW",
      html: `<h1>Email Confirmation</h1>
             <p>Thank you for subscribing!</p>
             <p>Please confirm your email by clicking on the following link: </p>
             <a href="${BASE_URL}/users/verify/${verificationToken}">Click here</a>`,
    };
    sendEmail(data);

    res.json({
      message: "Verification email sent",
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
  updateUserAvatar,
  verifyUserEmail,
  sendVerifLetter,
};
