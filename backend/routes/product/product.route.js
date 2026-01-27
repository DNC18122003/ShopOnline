const express = require("express");
const  productController = require("../../controller/productController")

const router = express.Router();
router.get("/", productController.getProducts);
router.get("/:id/similar", productController.getSimilarProducts);
router.get("/:id", productController.getProductById);

module.exports = router;