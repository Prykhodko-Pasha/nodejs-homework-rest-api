const express = require("express");
const router = express.Router();
const userController = require("../../controllers/userController");

router.post("/signup", userController.registerUser);

router.post("/login", userController.loginUser);

router.get("/logout", userController.logoutUser);

router.get("/current", userController.getCurrentUser);

module.exports = router;
