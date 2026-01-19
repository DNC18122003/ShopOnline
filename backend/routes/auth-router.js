const express = require('express');
const { loginController, loginWithGoogleController } = require('../controller/authController');
const router = express.Router();

// api login
router.post('/login', loginController);
router.post('/login-with-google', loginWithGoogleController);
module.exports = router;