// controller/otp.controller.js

const {
  sendOTPService,
  verifyOTPService,
} = require("../services/otp.service");

const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    await sendOTPService(email, req.session);

    return res.json({ message: "OTP sent successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error sending OTP" });
  }
};

const verifyOTP = (req, res) => {
  const { otp } = req.body;

  const result = verifyOTPService(otp, req.session);

  if (!result.success) {
    return res.status(400).json({ message: result.message });
  }

  return res.json({ message: "OTP verified successfully" });
};

module.exports = { sendOTP, verifyOTP };