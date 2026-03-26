const express = require('express');
const { getProfileEmployeeController } = require('../controller/user/profile.controller');
const { isAuth } = require('../middleware/authorization');
const { upload } = require('../middleware/upload');
const router = express.Router();


// api profile 
// middleware => router.post('/profile', isAuth, checkRoleAndStatus(['User']),  loginController);
router.get('/profile-employee', isAuth, getProfileEmployeeController);
// router.put('/profile', isAuth, updateProfileController);
// router.put('/profile/avatar', isAuth, upload.single("avatar"), updateAvatarController);

module.exports = router;