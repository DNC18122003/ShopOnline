const express = require('express');
const { loginController, registerController, loginWithGoogleController, logoutController,getMeController } = require('../controller/authController');
const router = express.Router();

// api login
router.post('/login', loginController);
router.post('/register', registerController);
router.post('/login-with-google', loginWithGoogleController);
router.post('/logout', logoutController);
router.get('/me', getMeController);

module.exports = router;

