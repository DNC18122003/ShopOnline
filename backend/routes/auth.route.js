const express = require("express");
const {
  loginController,
  registerController,
  loginWithGoogleController,
  logoutController,
  getMe
} = require("../controller/auth.controller");
const router = express.Router();

// api login
router.post("/login", loginController);
router.post("/register", registerController);
router.post("/login-with-google", loginWithGoogleController);
router.post("/logout", logoutController);
router.get("/me", getMe);
module.exports = router;
