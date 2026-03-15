const express = require("express");
const saleDashboardController = require("../../controller/saleDashboard/saleDashboardController");
const { isAuth } = require("../../middleware/authorization");
const router = express.Router();
router.get("/summary", saleDashboardController.getDashboardSummary);
module.exports = router;
