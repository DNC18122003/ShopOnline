// routes/otp.route.js

const express = require("express");
const { sendOTP, verifyOTP } = require("../controller/otp.controller");

const router = express.Router();

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

module.exports = router;