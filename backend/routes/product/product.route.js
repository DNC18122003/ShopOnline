const express = require("express");
const  productController = require("../../controller/productController")
const compatibilityController = require("../../controller/compatibilityController");
const { authenticateToken } = require("../../middleware/authorization");

const router = express.Router();

router.post("/build-pc/check-compatibility", compatibilityController.checkCompatibility);
router.post("/", authenticateToken, productController.createProduct);
router.put("/:id", authenticateToken, productController.updateProduct);
router.delete("/:id", authenticateToken, productController.deleteProduct);
router.get("/", productController.getProducts);
router.get("/:id/similar", productController.getSimilarProducts);
router.get("/:id", productController.getProductById);

module.exports = router;