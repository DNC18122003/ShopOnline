const express = require('express');
const { getUsersCustomerController, getNumberOfUser, getUserSaleController, getUserStaffController, getUserAdminController, } = require('../controller/user/user.controller');
const { getTotalOrder, createNewEmployee, updateUserStatus, getDetailAdmin, getDetailStaff, getDetailSales, getDetailCustomer } = require('../controller/admin.controller');
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
router.put('/accounts/status', isAuth, checkRoleAndStatus(['Admin']), updateUserStatus);
router.get('/accounts/details-admin/:id', isAuth, checkRoleAndStatus(['Admin']), getDetailAdmin);
router.get('/accounts/details-staff/:id', isAuth, checkRoleAndStatus(['Admin']), getDetailStaff);
router.get('/accounts/details-sales/:id', isAuth, checkRoleAndStatus(['Admin']), getDetailSales);
router.get('/accounts/details-customer/:id', isAuth, checkRoleAndStatus(['Admin']), getDetailCustomer);
module.exports = router;