const express = require("express");
const orderController = require("../../controller/order/order.controller");
const {getAddress} = require('../../controller/order/address.controller')
const router = express.Router();

// getAddress
router.get("/geocode/reverse", getAddress);

router.get("/", orderController.getAllOrder);
router.get("/my-orders", orderController.getMyOrders);
router.post("/create", orderController.createOrder);
router.get("/:orderId", orderController.getOrderById);
router.put("/:orderId/status", orderController.updateOrderStatus);


module.exports = router;