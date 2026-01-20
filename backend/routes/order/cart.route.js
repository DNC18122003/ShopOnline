const express = require("express");

const router = express.Router();
router.get("/", auth, getCart);
router.post("/add", auth, addToCart);
router.put("/update", auth, updateCartItem);
router.delete("/remove/:productId", auth, removeCartItem);
router.delete("/clear", auth, clearCart);

module.exports = router;