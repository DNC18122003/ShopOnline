const express = require("express");
const orderController = require("../../controller/order/order.controller");
const saleController = require("../../controller/sale/sale.controller");
const { getAddress } = require("../../controller/order/address.controller");
const { authenticateToken,checkRoleAndStatus} = require("../../middleware/authorization");
const { confirmMomoPayment,cancelMomoPayment} = require("../../controller/order/momo.controller");

const router = express.Router();
router.get("/geocode/reverse", getAddress);

router.use(authenticateToken);

router.get("/my-orders", orderController.getMyOrders);
router.post("/create", orderController.createOrder);
router.get("/:orderId", orderController.getOrderById);

router.get("/",checkRoleAndStatus(["admin", "sale"]),orderController.getAllOrder);
router.patch("/:orderId/status",checkRoleAndStatus(["admin", "sale"]),orderController.updateOrderStatus);
router.patch("/:orderId/cancel", orderController.cancelMyOrder);
router.post("/momo/confirm", confirmMomoPayment);
router.post("/momo/cancel", cancelMomoPayment);

// Nhóm các route chuyên biệt cho Sale để dễ quản lý
router.get("/sale/pending-assignments", checkRoleAndStatus(["sale"]), saleController.getPendingAssignments);
router.post("/sale/accept/:orderId", checkRoleAndStatus(["sale"]), saleController.acceptOrder);
router.post("/sale/reject/:orderId", checkRoleAndStatus(["sale"]), saleController.rejectOrder);
router.get("/sale/my-processing", checkRoleAndStatus(["sale"]), saleController.getMyProcessingOrders);

module.exports = router;
