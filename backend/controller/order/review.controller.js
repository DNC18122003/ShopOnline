const Review = require("../../models/order/Review");
const Order = require("../../models/order/Order");

/**
 * Tạo đánh giá sản phẩm
 */
exports.createReview = async (req, res) => {
  try {
    const { productId, orderId, rating, comment, images, videos } = req.body;
    const userId = req.user._id;

    // kiểm tra đơn hàng tồn tại
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Đơn hàng không tồn tại",
      });
    }

    // kiểm tra user có phải chủ đơn hàng không
    if (order.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Bạn không có quyền đánh giá đơn hàng này",
      });
    }

    // kiểm tra sản phẩm có trong đơn hàng không
    const productInOrder = order.items.find(
      (item) => item.productId.toString() === productId
    );

    if (!productInOrder) {
      return res.status(400).json({
        message: "Sản phẩm không tồn tại trong đơn hàng",
      });
    }

    // kiểm tra đã đánh giá chưa
    const existingReview = await Review.findOne({
      productId,
      orderId,
      userId,
    });

    if (existingReview) {
      return res.status(400).json({
        message: "Bạn đã đánh giá sản phẩm này rồi",
      });
    }

    const review = await Review.create({
      productId,
      orderId,
      userId,
      rating,
      comment,
      images,
      videos,
    });

    res.status(201).json({
      message: "Đánh giá thành công",
      review,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi tạo đánh giá",
      error: error.message,
    });
  }
};

/**
 * Lấy review theo sản phẩm
 */
exports.getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({
      productId,
      isActive: true,
    })
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi lấy review",
      error: error.message,
    });
  }
};

/**
 * Lấy review của user
 */
exports.getMyReviews = async (req, res) => {
  try {
    const userId = req.user._id;

    const reviews = await Review.find({ userId })
      .populate("productId", "name images price")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi lấy review",
      error: error.message,
    });
  }
};

/**
 * Cập nhật review
 */
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, images, videos } = req.body;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        message: "Review không tồn tại",
      });
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Bạn không có quyền sửa review này",
      });
    }

    review.rating = rating ?? review.rating;
    review.comment = comment ?? review.comment;
    review.images = images ?? review.images;
    review.videos = videos ?? review.videos;

    await review.save();

    res.json({
      message: "Cập nhật review thành công",
      review,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi cập nhật review",
      error: error.message,
    });
  }
};

/**
 * Xóa review (soft delete)
 */
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        message: "Review không tồn tại",
      });
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Bạn không có quyền xóa review này",
      });
    }

    review.isActive = false;
    await review.save();

    res.json({
      message: "Xóa review thành công",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi xóa review",
      error: error.message,
    });
  }
};
