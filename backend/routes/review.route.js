const express = require("express");
const router = express.Router();
const {
  getReviewByProductId,
} = require("../controller/reviewController");


// GET /api/reviews/:id - Lấy tất cả đánh giá của sản phẩm theo productId
router.get("/:id", getReviewByProductId);



module.exports = router;
