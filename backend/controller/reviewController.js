const Review = require("../models/Review/Review");
const Product = require("../models/Products/Product");

/**
 * GET /api/reviews/:id
 * Lấy tất cả đánh giá của một sản phẩm theo productId
 */
const getReviewByProductId = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm tất cả reviews của sản phẩm
    const reviews = await Review.find({
      productId: id,
      isActive: true,
    })
      .populate("userId", "fullName email avatar")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    console.error("Get reviews by product id error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

module.exports = {
  getReviewByProductId
};
