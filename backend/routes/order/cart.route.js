const express = require("express");
const  cartController = require("../../controller/order/cart.controller");
const {authenticateToken} = require("../../middleware/authorization");
const router = express.Router();
router.get("/",authenticateToken, cartController.getCart);
router.post("/add",authenticateToken, cartController.addToCart);
router.put("/update",authenticateToken,cartController.updateCart);
router.delete("/remove/:productId",authenticateToken, cartController.deleteCart);
router.delete("/clear",authenticateToken, cartController.clearCart);
router.post("/merge", authenticateToken,cartController.mergeCart);

module.exports = router;