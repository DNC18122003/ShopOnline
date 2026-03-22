const express = require('express');
const { getUsersCustomerController, getNumberOfUser, getUserSaleController, getUserStaffController, getUserAdminController } = require('../controller/user/user.controller');
const { getTotalOrder, createNewEmployee } = require('../controller/admin.controller');
const { isAuth, checkRoleAndStatus } = require('../middleware/authorization');
const router = express.Router();

// admin
router.get('/accounts', isAuth, checkRoleAndStatus(['Admin']), getUsersCustomerController);
router.get('/total-orders', isAuth, checkRoleAndStatus(['Admin']), getTotalOrder);
router.get('/number-of-users', isAuth, checkRoleAndStatus(['Admin']), getNumberOfUser);
router.get('/user-sale', isAuth, checkRoleAndStatus(['Admin']), getUserSaleController);
router.get('/user-staff', isAuth, checkRoleAndStatus(['Admin']), getUserStaffController);
router.get('/user-admin', isAuth, checkRoleAndStatus(['Admin']), getUserAdminController);
router.post('/create-employee', isAuth, checkRoleAndStatus(['Admin']), createNewEmployee);
module.exports = router;