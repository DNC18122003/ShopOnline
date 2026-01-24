const express = require('express');
const { loginController, registerController, loginWithGoogleController, logoutController } = require('../controller/authController');
const router = express.Router();

// api login
router.post('/login', loginController);
router.post('/register', registerController);
router.post('/login-with-google', loginWithGoogleController);
router.post('/logout', logoutController);
module.exports = router;