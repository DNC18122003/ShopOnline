
// config/passport.js
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/User'); // Import model User của bạn
require('dotenv').config();

// trích xuất cookie từ request
const cookieExtractor = (req) => {
  let token = null;

  // check req có cookie không
  //console.log("Request cookies:", req.cookies);
  if (req && req.cookies) {
    token = req.cookies['accessToken'];
  } else {
    console.log('No cookies object found');
  }


  return token;
}
// cấu hình otps
const opts = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: process.env.JWT_SECRET,
}


// Giai cookie lấy user data gán vào " cau hinh passport"
const passportConfig = (passport) => {
  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      try {
        // jwt_payload chứa dữ liệu bạn đã mã hóa (thường là { id: ..., email: ... })
        const user = await User.findById(jwt_payload.id);

        if (user) {
          // Tìm thấy user -> Cho qua và gán vào req.user
          return done(null, user);
        }
        // Không tìm thấy user (dù token đúng format) -> Chặn
        return done(null, false);
      } catch (err) {
        return done(err, false);
      }
    })
  );
};

module.exports = { passportConfig };
    /*
    Mô hình hóa Flow Middleware chuẩn
    Hãy hình dung quy trình xử lý 1 request vào API bảo mật (ví dụ: /admin/dashboard) sẽ đi qua 3 cửa ải:
    
    Cửa 1 (Authentication - Passport): Kiểm tra Token/Cookie xem có hợp lệ không? -> Nếu OK, gắn User vào req.user.
    
    Cửa 2 (Business Check - Custom): Kiểm tra req.user.isActive có true không?
    
    Cửa 3 (Authorization - Custom): Kiểm tra req.user.role có phải admin không?
    
    */