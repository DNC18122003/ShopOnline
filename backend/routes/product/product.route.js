const express = require("express");
const productController = require("../../controller/productController")
const compatibilityController = require("../../controller/compatibilityController");
const { isAuth, checkRoleAndStatus } = require("../../middleware/authorization");

const router = express.Router();

router.post("/build-pc/check-compatibility", compatibilityController.checkCompatibility);
router.get("/", productController.getProducts);
router.get("/:id/similar", productController.getSimilarProducts);
router.get("/:id", productController.getProductById);
router.get("/top-bought/limit", productController.getProductsTopBought);

// Staff/Admin APIs
router.post("/", isAuth, checkRoleAndStatus(["staff", "admin"]), productController.createProduct);
router.put("/:id", isAuth, checkRoleAndStatus(["staff", "admin"]), productController.updateProduct);
router.delete("/:id", isAuth, checkRoleAndStatus(["staff", "admin"]), productController.deleteProduct);

module.exports = router;