const express = require('express');
const { loginController } = require('../controller/auth.controller');
const router = express.Router();


// api profile 
// middleware => router.post('/profile', isAuth, checkRoleAndStatus(['User']),  loginController);
router.post('/profile', loginController);
module.exports = router;