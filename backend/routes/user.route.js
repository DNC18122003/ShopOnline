const express = require('express');
const { getProfileController } = require('../controller/user/profile.controller');
const { isAuth } = require('../middleware/authorization');
const router = express.Router();


// api profile 
// middleware => router.post('/profile', isAuth, checkRoleAndStatus(['User']),  loginController);
router.get('/profile', isAuth, getProfileController);
module.exports = router;