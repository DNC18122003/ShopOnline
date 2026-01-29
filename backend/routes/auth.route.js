const express = require("express");
const {
  loginController,
  registerController,
  loginWithGoogleController,
  logoutController,
  getMe
} = require("../controller/auth.controller");
const { isAuth } = require("../middleware/authorization");
const router = express.Router();

// api login
router.post("/login", loginController);
router.post("/register", registerController);
router.post("/login-with-google", loginWithGoogleController);
router.post("/logout", logoutController);
router.get("/me",isAuth, getMe);
module.exports = router;
