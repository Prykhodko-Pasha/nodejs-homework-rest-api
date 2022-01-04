const express = require("express");
const router = express.Router();
const userController = require("../../controllers/userController");
const { authenticate } = require("../../middlewares/auth");

router.post("/signup", userController.registerUser);

router.post("/login", userController.loginUser);

router.get("/logout", authenticate, userController.logoutUser);

router.get("/current", authenticate, userController.getCurrentUser);

router.patch("/", authenticate, userController.updateUserSubscription);

module.exports = router;
