// services/otp.service.js

const generateOTP = require("../utils/generate-otp");
const { sendMail } = require("./mail.service");

const sendOTPService = async (email, session) => {
  const otp = generateOTP();

  session.otp = otp;
  session.email = email;

  await sendMail(
    email,
    "Your OTP Code",
    `<h3>Your OTP is: ${otp}</h3>`
  );

  return true;
};

const verifyOTPService = (userOtp, session) => {
  if (!session.otp) {
    return { success: false, message: "OTP expired" };
  }

  if (session.otp === userOtp) {
    session.otp = null;
    return { success: true };
  }

  return { success: false, message: "Invalid OTP" };
};

module.exports = { sendOTPService, verifyOTPService };