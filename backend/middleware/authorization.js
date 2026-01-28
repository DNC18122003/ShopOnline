const passport = require("passport");
const jwt = require("jsonwebtoken");

// 1. Middleware xác thực jwt (passport)
const isAuth = passport.authenticate("jwt", { session: false });

// 2. Middleware phân quyền
const checkRoleAndStatus = (roles) => {
  return (req, res, next) => {
    next();
  };
};

// 3. Auth

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (!decoded || !decoded._id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }
    req.user = {
      _id: decoded._id,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  });
};

module.exports = {
  isAuth,
  checkRoleAndStatus,
  authenticateToken,
};
