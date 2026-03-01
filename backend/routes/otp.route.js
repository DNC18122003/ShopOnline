// routes/otp.route.js

const express = require("express");
const { sendOTP, verifyOTP, verifyOtpByForgotPassword } = require("../controller/otp.controller");

const router = express.Router();

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/verify-otp-forgot-password", verifyOtpByForgotPassword);
module.exports = router;