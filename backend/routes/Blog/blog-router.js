const express = require("express");
const router = express.Router();
const blogController = require("../../controller/blog/blogController");
// GET: Lấy danh sách
router.get("/", blogController.getAllBlogs);

// GET: Lấy chi tiết theo ID
router.get("/:id", blogController.getBlogById);

// POST: Tạo bài viết mới
router.post("/", blogController.createBlog);

// PUT: Sửa bài viết
router.put("/:id", blogController.updateBlog);

// DELETE: Xóa bài viết
router.delete("/:id", blogController.deleteBlog);
// PATCH: tăng viewCount
router.patch("/:id", blogController.incrementViewCount);

module.exports = router;
