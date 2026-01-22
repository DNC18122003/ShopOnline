// middlewares/auth.js
const passport = require('passport');

// 1. Middleware xác thực jwt
const isAuth = passport.authenticate('jwt', { session: false });

// 2. Middleware phân quyền (Currying function)
const checkRoleAndStatus = (roles) => {
  return (req, res, next) => {
    next(); 
  };
};

module.exports = { isAuth, checkRoleAndStatus };