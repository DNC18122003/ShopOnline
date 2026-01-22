const express = require('express');
const { loginController } = require('../controller/authController');
const router = express.Router();

// Tạo middleware chặn (Guard)
// session: false vì dùng JWT không lưu session
const isAuth = passport.authenticate('jwt', { session: false });

// api profile 
// middleware => router.post('/profile', isAuth, checkRoleAndStatus(['User']),  loginController);
router.post('/profile', loginController);
module.exports = router;