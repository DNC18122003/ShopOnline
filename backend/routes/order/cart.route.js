const express = require("express");
const  cartController = require("../../controller/order/cart.controller")
const {isAuth} = require("../../middleware/authorization")
const router = express.Router();
router.get("/", cartController.getCart);
router.post("/add", cartController.addToCart);
router.put("/update",cartController.updateCart);
router.delete("/remove/:productId", cartController.deleteCart);
router.delete("/clear", cartController.clearCart);

module.exports = router;