const express = require("express");
const  productController = require("../../controller/productController")
const compatibilityController = require("../../controller/compatibilityController");

const router = express.Router();

router.post("/build-pc/check-compatibility", compatibilityController.checkCompatibility);
router.get("/", productController.getProducts);
router.get("/:id/similar", productController.getSimilarProducts);
router.get("/:id", productController.getProductById);

module.exports = router;