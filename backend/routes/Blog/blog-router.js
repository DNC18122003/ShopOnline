const express = require("express");
const router = express.Router();
const blogController = require("../../controller/Blog/blogController");
// GET: Lấy danh sách
router.get("/", blogController.getAllBlogs);

// GET: Lấy chi tiết theo ID
router.get("/:id", blogController.getBlogById);

// GET: Lấy chi tiết theo Slug (Ví dụ: /api/blog/detail/huong-dan-code)
router.get("/detail/:slug", blogController.getBlogBySlug);

// POST: Tạo bài viết mới
router.post("/", blogController.createBlog);

// PUT: Sửa bài viết
router.put("/:id", blogController.updateBlog);

// DELETE: Xóa bài viết
router.delete("/:id", blogController.deleteBlog);

module.exports = router;