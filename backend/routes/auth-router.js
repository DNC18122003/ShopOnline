const express = require('express');
const { loginController, registerController, loginWithGoogleController } = require('../controller/authController');
const router = express.Router();

// api login
router.post('/login', loginController);
router.post('/register', registerController);
router.post('/login-with-google', loginWithGoogleController);
module.exports = router;