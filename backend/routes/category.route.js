const express = require("express");
const categoryController = require("../controller/categoryController");

const router = express.Router();

// GET /api/categories - Lấy danh sách danh mục
router.get("/", categoryController.getCategories);

// GET /api/categories/slug/:slug - Lấy danh mục theo slug
router.get("/slug/:slug", categoryController.getCategoryBySlug);

// GET /api/categories/:id - Lấy danh mục theo ID
router.get("/:id", categoryController.getCategoryById);

// POST /api/categories - Tạo danh mục mới
router.post("/", categoryController.createCategory);

// PUT /api/categories/:id - Cập nhật danh mục
router.put("/:id", categoryController.updateCategory);

// DELETE /api/categories/:id - Xóa danh mục
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;
