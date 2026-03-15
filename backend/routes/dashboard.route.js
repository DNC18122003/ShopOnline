const express = require("express");
const router = express.Router();
const { getStaffDashboardData } = require("../controller/dashboardController");
router.get("/staff", getStaffDashboardData);

module.exports = router;
