const express = require("express");
const {
  loginController,
  registerController,
  loginWithGoogleController,
  logoutController,
  getMe,
  findEmailForgotPassword,
  changeByForgotPassword,
  changePasswordByOldPassword
} = require("../controller/auth.controller");
const { isAuth } = require("../middleware/authorization");
const router = express.Router();

// api login
router.post("/login", loginController);
router.post("/register", registerController);
router.post("/login-with-google", loginWithGoogleController);
router.post("/logout", logoutController);
router.get("/me",isAuth, getMe);
router.post("/find-email", findEmailForgotPassword);
router.post("/change-password", changeByForgotPassword);
router.post("/change-password-by-old-password", isAuth, changePasswordByOldPassword);
module.exports = router;
