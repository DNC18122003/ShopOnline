// controller/otp.controller.js

const {
  sendOTPService,
  verifyOTPService,
} = require("../services/otp.service");
const User = require("../models/User");
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    await sendOTPService(email, req.session);

    return res.json({ message: "Gửi otp thành công !" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi gửi OTP" });
  }
};

const verifyOTP = async (req, res) => {
  const { otp, email } = req.body;

  const result = verifyOTPService(otp, email, req.session);

  if (!result.success) {
    return res.status(400).json({ message: result.message });
  }
  // câp nhật lại trạng thái user 
  const user = await User.findOne({ email: email });
  if (user) {
    user.isActive = true;
    await user.save();
  }
  return res.json({ message: "Xác thực OTP thành công !" });
};

module.exports = { sendOTP, verifyOTP };