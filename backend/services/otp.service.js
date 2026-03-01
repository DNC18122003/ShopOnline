// services/otp.service.js

const generateOTP = require("../utils/generate-otp");
const { sendMail } = require("./mail.service");

const sendOTPService = async (email, session) => {
  const otp = generateOTP();
// Lưu OTP và email vào session
  session.otp = otp;
  session.email = email;

  await sendMail(
    email,
    "Mã OTP của bạn",
    `<h3>Mã OTP của bạn là: ${otp}</h3>`
  );

  return true;
};

const verifyOTPService = (userOtp, userEmail, session) => {
  if (!session.otp || !session.email) {
    return { success: false, message: "Session không hợp lệ hoặc OTP đã hết hạn" };
  }

   // Kiểm tra OTP và email
  if (session.otp === userOtp && session.email === userEmail) {
    // Xóa OTP và email sau khi xác thực thành công
    session.otp = null;
    session.email = null; // Xóa email để bảo mật
    return { success: true };
  }
  return { success: false, message: "Mã OTP không hợp lệ" };
};

module.exports = { sendOTPService, verifyOTPService };