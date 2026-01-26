const express = require("express");
const  cartController = require("../../controller/order/cart.controller");
const {isAuth,optionalAuth,authenticateToken} = require("../../middleware/authorization");
const router = express.Router();
router.get("/",optionalAuth, cartController.getCart);
router.post("/add",authenticateToken, cartController.addToCart);
router.put("/update",cartController.updateCart);
router.delete("/remove/:productId", cartController.deleteCart);
router.delete("/clear", cartController.clearCart);
router.delete("/merge", cartController.mergeCart);

module.exports = router;