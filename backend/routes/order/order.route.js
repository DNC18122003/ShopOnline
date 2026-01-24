const express = require("express");
const orderController = require("../../controller/order/order.controller");
const router = express.Router();

router.get("/", orderController.getAllOrder);
router.get("/my-orders", orderController.getMyOrders);
router.post("/create", orderController.createOrder);
router.get("/:orderId", orderController.getOrderById);
router.put("/:orderId/status", orderController.updateOrderStatus);

module.exports = router;