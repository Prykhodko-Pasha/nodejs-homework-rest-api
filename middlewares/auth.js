const jwt = require("jsonwebtoken");
const { User } = require("../model/user");

const { SECRET_KEY } = process.env;

const authenticate = async (req, res, next) => {
  const { authorization } = req.headers;
  const [bearer, token] = authorization?.split(" ");
};

module.exports = authenticate;
