const express = require("express");
const orderController = require("../../controller/order/order.controller");
const { getAddress } = require("../../controller/order/address.controller");
const { authenticateToken,checkRoleAndStatus} = require("../../middleware/authorization");

const router = express.Router();
router.get("/geocode/reverse", getAddress);

router.use(authenticateToken);

router.get("/my-orders", orderController.getMyOrders);
router.post("/create", orderController.createOrder);
router.get("/:orderId", orderController.getOrderById);

router.get("/",checkRoleAndStatus(["admin", "staff"]),orderController.getAllOrder);
router.put("/:orderId/status",checkRoleAndStatus(["admin", "staff"]),orderController.updateOrderStatus);


module.exports = router;
