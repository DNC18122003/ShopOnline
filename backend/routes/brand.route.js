const express = require("express");
const brandController = require("../controller/brandController");

const router = express.Router();

// GET /api/brands - Lấy danh sách thương hiệu
router.get("/", brandController.getBrands);

// GET /api/brands/slug/:slug - Lấy thương hiệu theo slug
router.get("/slug/:slug", brandController.getBrandBySlug);

// GET /api/brands/:id - Lấy thương hiệu theo ID
router.get("/:id", brandController.getBrandById);

// POST /api/brands - Tạo thương hiệu mới
router.post("/", brandController.createBrand);

// PUT /api/brands/:id - Cập nhật thương hiệu
router.put("/:id", brandController.updateBrand);

// PATCH /api/brands/:id/toggle-status - Toggle trạng thái thương hiệu
router.patch("/:id/toggle-status", brandController.toggleBrandStatus);

// DELETE /api/brands/:id - Xóa thương hiệu
router.delete("/:id", brandController.deleteBrand);

module.exports = router;
