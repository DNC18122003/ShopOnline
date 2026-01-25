// middlewares/auth.js
const passport = require('passport');
const jwt = require("jsonwebtoken");
// 1. Middleware xác thực jwt
const isAuth = passport.authenticate('jwt', { session: false });

// 2. Middleware phân quyền (Currying function)
const checkRoleAndStatus = (roles) => {
  return (req, res, next) => {
    next(); 
  };
};

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) return next();

  jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
    if (!err) req.user = decoded;
    next(); 
  });
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};


module.exports = { isAuth, checkRoleAndStatus, optionalAuth, authenticateToken };