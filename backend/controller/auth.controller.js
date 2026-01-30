// import
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const hashPassword = require("../utils/hash-password");
// controller for login
const loginController = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản" });
    }
    // Check password using bcrypt.compare
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Mật khẩu không đúng" });
    }
    // Create jwt token
    const token = jwt.sign(
      {
        _id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    
    // Set token in cookie
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });
    // set data use to response
    const userResponse = {
      id: user._id,
      email: user.email,
      userName: user.userName,
      role: user.role,
      fullName: user.fullName,
      phone: user.phone,
      avatar: user.avatar,
      // Thêm các field khác nếu cần
    };

    return res.status(200).json({
      message: "Login successful",
      user: userResponse,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
// controller for register
const registerController = async (req, res) => {
  const { userName, email, password } = req.body;
  console.log(
    "Register controller called in backend:",
    userName,
    email,
    password
  );
  // validate data in backend
  if (!userName || !email || !password) {
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
  }
  try {
    // check emai exist
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }
    // check userName exist
    const existingUserName = await User.findOne({ userName });
    if (existingUserName) {
      return res.status(400).json({ message: "Tên người dùng đã được sử dụng" });
    }
    //hash password
    const hash_Password = await hashPassword(password);
    const newUser = new User({
      userName,
      email,
      password: hash_Password,
    });
    //create new user
    await newUser.save();
    return res.status(201).json({
      message: "Tài khoản đã được tạo thành công",
      user: {
        id: newUser._id,
        userName: newUser.userName,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};
// controller for logout
const logoutController = async (req, res) => {
  try {
    // log associated user out
    console.log("Logout controller called in backend");
    console.log("accessToken:", req.cookies.accessToken);
    res.clearCookie("accessToken");
    return res.status(200).json({ message: "Đăng xuất thành công" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// controller for login with google
const loginWithGoogleController = async (req, res) => {};

// check user
const getMe = async (req, res) => {
  try {
    const userId = req.user._id; 

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("GET ME ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  loginController,
  loginWithGoogleController,
  registerController,
  logoutController,
  getMe
};
