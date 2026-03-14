const Review = require("../../models/order/Review");
const Order = require("../../models/order/Order");
const { uploadMediaToCloudinary, uploadToCloudinary } = require("../../middleware/upload");
/**
 * Tạo đánh giá sản phẩm
 */
exports.createReview = async (req, res) => {
  try {
  
    const { productId, orderId, rating, comment } = req.body;
    const userId = req.user._id;

    let images = [];
    let videos = [];

    if (req.files && req.files.length > 0) {
      const imageFiles = req.files.filter((file) =>
        file.mimetype.startsWith("image")
      );

      const videoFiles = req.files.filter((file) =>
        file.mimetype.startsWith("video")
      );

      if (imageFiles.length > 5) {
        return res.status(400).json({
          message: "Chỉ được upload tối đa 5 ảnh",
        });
      }

      if (videoFiles.length > 1) {
        return res.status(400).json({
          message: "Chỉ được upload tối đa 1 video",
        });
      }

      if (imageFiles.length > 0) {
        const uploadedImages = await uploadToCloudinary(
          imageFiles,
          "reviews/images/"
        );

        images = uploadedImages.map((img) => img.Url); //  chỉ lưu URL
      }

      if (videoFiles.length > 0) {
        const uploadedVideos = await uploadMediaToCloudinary(
          videoFiles,
          "reviews/videos/"
        );

        videos = uploadedVideos.map((video) => video.Url); //  chỉ lưu URL
      }
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Đơn hàng không tồn tại",
      });
    }

    if (order.customerId.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Bạn không có quyền đánh giá đơn hàng này",
      });
    }

    const productInOrder = order.items.find(
      (item) => item.productId.toString() === productId
    );

    if (!productInOrder) {
      return res.status(400).json({
        message: "Sản phẩm không tồn tại trong đơn hàng",
      });
    }

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

exports.checkReview = async (req, res) => {
  try {
    const { orderId, productId } = req.params;
    const userId = req.user._id;

    const review = await Review.findOne({
      orderId,
      productId,
      userId,
      isActive: true,
    });

    res.json({
      reviewed: !!review,
      review,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi kiểm tra review",
      error: error.message,
    });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, rating, search } = req.query;

    const query = { isActive: true };

    if (rating) {
      query.rating = Number(rating);
    }

    const reviews = await Review.find(query)
      .populate("productId", "name images")
      .populate("userId", "fullName userName email avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Review.countDocuments(query);

    res.json({
      reviews,
      pagination: {
        page: Number(page),
        totalPages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi lấy danh sách review",
      error: error.message,
    });
  }
};

exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("productId", "name images price")
      .populate("userId", "name avatar email")
      .populate("orderId", "_id createdAt");

    if (!review) {
      return res.status(404).json({
        message: "Review không tồn tại",
      });
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi lấy chi tiết review",
      error: error.message,
    });
  }
};

exports.toggleReviewStatus = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: "Review không tồn tại",
      });
    }

    review.isActive = !review.isActive;

    await review.save();

    res.json({
      message: "Cập nhật trạng thái review thành công",
      review,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi cập nhật trạng thái review",
      error: error.message,
    });
  }
};