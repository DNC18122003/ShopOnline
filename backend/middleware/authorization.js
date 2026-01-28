// middlewares/auth.js
const passport = require('passport');

// 1. Middleware xác thực jwt
const isAuth = (req, res, next) => {
  //console.log('=== isAuth Middleware ===');
  // console.log('Headers:', req.headers);
  // console.log('Cookies:', req.cookies);
  
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      console.log('Authentication error:', err);
      return res.status(500).json({ message: 'Internal error' });
    }
    
    if (!user) {
      console.log('Authentication failed:', info.message);
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    console.log('Authentication successful:', user.email);
    req.user = user;
    next();
  })(req, res, next);
};

// 2. Middleware phân quyền (Currying function)
const checkRoleAndStatus = (roles) => {
  return (req, res, next) => {
    try {
      // Kiểm tra user có tồn tại không
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized - User not authenticated'
        });
      }

      // Kiểm tra user có active không
      if (!req.user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden - User account is inactive'
        });
      }

      // Chuyển roles thành mảng nếu là string
      const allowedRoles = Array.isArray(roles) ? roles : [roles];

      // Kiểm tra user role có nằm trong danh sách roles cho phép không
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Forbidden - User role must be one of: ${allowedRoles.join(', ')}`
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  };
};

module.exports = { isAuth, checkRoleAndStatus };