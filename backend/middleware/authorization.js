const passport = require("passport");
const jwt = require("jsonwebtoken");

// 1. Middleware xác thực jwt
const isAuth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      console.error("JWT error:", err);
      return res.status(500).json({ message: "Authentication error" });
    }

    if (!user) {
      return res.status(401).json({
        message: info?.message || "Unauthorized",
      });
    }

    req.user = user; // chứa _id, role, email...
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
          message: "Unauthorized - User not authenticated",
        });
      }

      // Kiểm tra user có active không
      if (!req.user.isActive) {
        return res.status(403).json({
          success: false,
          message: "Forbidden - User account is inactive",
        });
      }

      // Chuyển roles thành mảng nếu là string
      const allowedRoles = Array.isArray(roles) ? roles : [roles];

      // Kiểm tra user role có nằm trong danh sách roles cho phép không
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Forbidden - User role must be one of: ${allowedRoles.join(
            ", "
          )}`,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  };
};
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

module.exports = { isAuth, checkRoleAndStatus, authenticateToken };
