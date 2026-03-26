// import
const User = require("../models/User");
const Employee = require("../models/Employee");
const Department = require("../models/Department");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const hashPassword = require("../utils/hash-password");
const { sendOTPService } = require("../services/otp.service");
// controller for login
const loginController = async (req, res) => {
  const { email, password } = req.body;
  const emailParsed = email.trim();
  const passwordParsed = password.trim();
  try {
    // Find user by email in User + Em
    const user = await User.findOne({ email: emailParsed });
    const employee = await Employee.findOne({ email: emailParsed }).populate("role");

    // console.log("Employee found in Employee collection:", employee ? employee._id
    //   + " -" + employee.role.code : null);
    if (!user && !employee) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản" });
    }
    // Check password using bcrypt.compare
    const isPasswordValid = await bcrypt.compare(passwordParsed, user ? user.password : employee.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Mật khẩu không đúng" });
    }
    // Create jwt token
    const token = jwt.sign(
      {
        _id: user ? user._id : employee._id,
        role: user ? user.role : employee.role.code,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    console.log("Generated JWT token:", token);
    console.log("User data for token payload:", {
      _id: user ? user._id : employee._id,
      role: user ? user.role : employee.role.code,
    });
    // Giải mã và hiển thị nội dung token để kiểm tra payload
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error("Error decoding JWT token:", err);
      } else {
        console.log("Decoded JWT token:", decoded); // Log thông tin nội dung của token (payload)
      }
    });
    // Set token in cookie
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });
    // set data use to response
    let userResponse = null;
    if (user) {
      userResponse = {
        id: user._id,
        email: user.email,
        userName: user.userName,
        role: user.role,
        fullName: user.fullName,
        phone: user.phone,
        avatar: user.avatar,
        isActive: user.isActive,
        address: user.address,
      };
    } else if (employee) {
      userResponse = {
        id: employee._id,
        email: employee.email,
        userName: employee.userName,
        role: employee.role.code,
        fullName: employee.fullName,
        phone: employee.phone,
        avatar: employee.avatar,
        isActive: employee.isActive,
        address: employee.address,
        regionManaged: employee.regionManaged,
      };
    }
    console.log("User response data:", userResponse);

    return res.status(200).json({
      message: "Login successful",
      user: userResponse,
      token: token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
// controller for register
const registerController = async (req, res) => {
  const { email, phoneNumber, password } = req.body;
  // vallidate data in backend
  const emailParsed = email.trim();
  const phoneNumberParsed = phoneNumber.trim();
  const passwordParsed = password.trim();
  // find email exist
  if (!phoneNumberParsed || !emailParsed || !passwordParsed) {
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
  }
  try {
    // check emai exist
    const existingUser = await User.findOne({ email: emailParsed });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }
    //hash password
    const hash_Password = await hashPassword(passwordParsed);
    // create auto generate userName from email
    const userNameParsed = emailParsed.split("@")[0] + Math.floor(Math.random() * 10000);
    console.log("Generated userName:", userNameParsed);
    const newUser = new User({
      userName: userNameParsed,
      email: emailParsed,
      password: hash_Password,
      fullName: null,        // Tên đầy đủ không có
      phone: phoneNumberParsed,
      avatar: null,          // Avatar không có
      role: 'customer',      // Mặc định là customer
      isActive: 'inactive',       // Mặc định là chưa active
    });
    //create new user
    await newUser.save();
    return res.status(201).json({
      message: "Tài khoản đã được tạo thành công",
      user: {
        id: newUser._id,
        userName: newUser.userName,
        email: newUser.email,
        googleId: null,      // Trả về null cho FE biết là chưa liên kết
        fullName: null,      // Trả về null cho FE biết là chưa có tên
        phone: null,
        avatar: null,
        role: newUser.role,
        active: newUser.isActive,
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
const loginWithGoogleController = async (req, res) => {
  /*
  trước khi kết hợp với passport thì flow như sau :
  
  */





};

// check user
const getMe = async (req, res) => {
  console.log("Get me controller called");
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("-password");
    const employee = await Employee.findById(userId).populate("role").select("-password");

    console.log("User found:", user);
    console.log("Employee found:", employee);

    if (!user && !employee) {
      return res.status(404).json({ message: "User not found" });
    }
    const employeeObj = employee?.toObject();
    return res.json({
      success: true,
      user: user || {
        ...employeeObj,
        role: employeeObj.role.code,
      },
    });
  } catch (error) {
    console.error("GET ME ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
// check email exist for forgot password
const findEmailForgotPassword = async (req, res) => {
  console.log("hi");
  const { email } = req.body;
  const emailParsed = email.trim();
  try {
    const user = await User.findOne({ email: emailParsed });
    const employee = await Employee.findOne({ email: emailParsed });
    if (!user && !employee) {
      return res.status(404).json({ message: "Email không tồn tại" });
    }
    // Email tồn tại, gửi email xác nhận
    await sendOTPService(emailParsed, req.session);
    return res.json({ success: true, message: "Email tồn tại", user: user || employee });
  } catch (error) {
    console.error("Error finding user:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
const changeByForgotPassword = async (req, res) => {
  console.log("hi forgot");
  const { email, newPassword } = req.body;
  const emailParsed = email.trim();
  const newPasswordParsed = newPassword.trim();
  try {
    const user = await User.findOne({ email: emailParsed });
    const employee = await Employee.findOne({ email: emailParsed });
    if (!user && !employee) {
      return res.status(404).json({ message: "Email không tồn tại" });
    }
    // Email tồn tại, tiến hành đổi mật khẩu
    const hashedPassword = await hashPassword(newPasswordParsed);
    if (user) {
      user.password = hashedPassword;
      await user.save();
    } else {
      employee.password = hashedPassword;
      await employee.save();
    }
    return res.json({ success: true, message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("Error finding user:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
const changePasswordByOldPassword = async (req, res) => {
  const userId = req.user._id;
  const { oldPassword, newPassword } = req.body;
  const oldPasswordParsed = oldPassword.trim();
  const newPasswordParsed = newPassword.trim();
  console.log("hi change by old password", oldPasswordParsed, newPasswordParsed);
  try {
    const user = await User.findById(userId);
    const employee = await Employee.findById(userId);
    if (!user && !employee) {
      return res.status(404).json({ message: "Tài khoản không tồn tại !" });
    }
    const isMatch = await bcrypt.compare(oldPasswordParsed, user ? user.password : employee.password);
    console.log("isMatch:", isMatch);
    if (!isMatch) {
      console.log("Mật khẩu cũ không đúng");
      return res.status(404).json({ message: "Mật khẩu cũ không đúng" });
    }
    const hashedPassword = await hashPassword(newPasswordParsed);
    if (user) {
      user.password = hashedPassword;
      await user.save();
    } else {
      employee.password = hashedPassword;
      await employee.save();
    }
    return res.json({ success: true, message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  loginController,
  loginWithGoogleController,
  registerController,
  logoutController,
  getMe,
  findEmailForgotPassword,
  changeByForgotPassword,
  changePasswordByOldPassword,
};
