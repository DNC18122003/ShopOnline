// controller/otp.controller.js

const {
  sendOTPService,
  verifyOTPService,
} = require("../services/otp.service");
const User = require("../models/User");
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const emailParsed = email.trim();

    await sendOTPService(emailParsed, req.session);

    return res.json({ message: "Gửi otp thành công !" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi gửi OTP" });
  }
};

const verifyOTP = async (req, res) => {
  const { otp, email } = req.body;
  const emailParsed = email.trim();
  const otpParsed = otp.trim();

  const result = verifyOTPService(otpParsed, emailParsed, req.session);

  if (!result.success) {
    return res.status(400).json({ message: result.message });
  }
  // câp nhật lại trạng thái user 
  const user = await User.findOne({ email: emailParsed });
  if (user) {
    user.isActive = "active";
    await user.save();
  }
  return res.json({ message: "Xác thực OTP thành công !" });
};
const verifyOtpByForgotPassword = async (req, res) => {
  const { otp, email } = req.body;
  const emailParsed = email.trim();
  const otpParsed = otp.trim();
  const result = verifyOTPService(otpParsed, emailParsed, req.session);
  if (!result.success) {
    return res.status(400).json({ message: result.message });
  }
  return res.json({ message: "Xác thực OTP thành công !" });
};

module.exports = { sendOTP, verifyOTP, verifyOtpByForgotPassword };