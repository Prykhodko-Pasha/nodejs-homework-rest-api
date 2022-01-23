const { Schema, model } = require("mongoose");
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const gravatar = require("gravatar");
// const nanoid = require("nanoid");

// eslint-disable-next-line no-useless-escape
const emailRegexp = /^\w+([\.-]?\w+)+@\w+([\.:]?\w+)+(\.[a-zA-Z0-9]{2,3})+$/;

const userSchema = Schema({
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter",
  },
  avatarURL: {
    type: String,
    default: null,
  },
  token: {
    type: String,
    default: null,
  },
  verify: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    required: [true, "Verify token is required"],
  },
});

userSchema.methods.setPassword = function (password) {
  this.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

userSchema.methods.generateAvatar = function (email) {
  this.avatarURL = gravatar.url(email, {
    protocol: "https",
    s: "250",
    d: "wavatar",
  });
};

// userSchema.methods.generateVerifToken = function () {
//   this.verificationToken = nanoid();
// };

const joiSchemaUser = Joi.object({
  password: Joi.string().min(6).required(),
  email: Joi.string().pattern(emailRegexp).required(),
});
const joiSchemaUserSubs = Joi.object({
  subscription: Joi.string().valid("starter", "pro", "business").required(),
});
const joiSchemaUserAvatar = Joi.object({
  avatarURL: Joi.string().required(),
});

const User = model("user", userSchema);

module.exports = {
  User,
  joiSchemaUser,
  joiSchemaUserSubs,
  joiSchemaUserAvatar,
};
