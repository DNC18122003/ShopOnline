
const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  checkRoleAndStatus,
} = require("../../middleware/authorization");
const dashboardController = require("../../controller/admin/adminDashboard");

router.get("/dashboard", dashboardController.getDashboard);

module.exports = router;
