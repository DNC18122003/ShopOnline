const express = require("express");
const cartController = require("../../controller/order/cart.controller");
const { isAuth } = require("../../middleware/authorization");
const router = express.Router();
router.get("/", isAuth, cartController.getCart);
router.post("/add", isAuth, cartController.addToCart);
router.put("/update",isAuth, cartController.updateCart);
router.delete("/remove/:productId",isAuth, cartController.deleteCart);
router.delete("/clear", isAuth, cartController.clearCart);


module.exports = router;
