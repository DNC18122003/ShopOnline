
// config/passport.js
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/User'); // Import model User của bạn
require('dotenv').config();

const opts = {
    // Lấy token từ Header: Authorization: Bearer <token>
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
};

const passportConfig = (passport) => {
    passport.use(
        new JwtStrategy(opts, async (jwt_payload, done) => {
            try {
                // check jwt => get _id => find data user by _id => return 
                const user = await User.findById(jwt_payload.id);
                if (user) {
                    return done(null, user);
                }
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