const mongoose = require("mongoose");
const Discount = require("../../models/Discounts/Discount");
const Order = mongoose.models.Order;
const Review = mongoose.models.Review;
const Blog = mongoose.models.Blog;

const saleDashboardController = {
  getDashboardSummary: async (req, res) => {
    try {
      // 1. Lấy tham số tháng và năm
      const { month, year } = req.query;

      if (!month || !year) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng cung cấp cả month và year",
        });
      }

      // 2. Tính toán khoảng thời gian
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);

      // 3. Query MongoDB
      const [
        orderResult,
        totalReviews,
        totalBlogs,
        topDiscounts,
        topBlogs,
        ReviewRating,
      ] = await Promise.all([
        // Truy vấn doanh thu và số đơn hàng
        Order.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lt: endDate },
              paymentStatus: { $in: ["paid"] },
            },
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$finalAmount" },
              totalOrders: { $sum: 1 },
            },
          },
        ]),
        // Truy vấn đếm số lượng review trong khoảng thời gian
        Review.countDocuments({
          createdAt: { $gte: startDate, $lt: endDate },
        }),
        Blog.countDocuments({
          createdAt: { $gte: startDate, $lt: endDate },
        }),
        Discount.aggregate([
          { $match: { status: "active" } },
          { $sort: { usedCount: -1 } }, // Sắp xếp theo số lượt dùng có sẵn
          { $limit: 5 },
          {
            // Chọn các trường muốn trả về
            $project: {
              _id: 0, // Ẩn id mặc định
              code: "$code",
              discountType: 1,
              value: 1,
              usedCount: 1,
            },
          },
        ]),
        Blog.aggregate([
          { $match: { status: "published" } },
          { $sort: { viewCount: -1 } },
          { $limit: 5 },
          {
            // Chọn các trường muốn trả về
            $project: {
              title: 1,
              viewCount: 1,
              author: 1,
              thumbnail: 1,
            },
          },
        ]),
        Review.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lt: endDate },
              isActive: true,
            },
          },
          {
            $group: {
              _id: "$rating", // Nhóm theo số sao
              count: { $sum: 1 }, // Đếm số lượng của từng mức sao
            },
          },
          {
            $group: {
              _id: null,
              totalReviews: { $sum: "$count" }, // Tổng tất cả review
              ratingDetails: {
                $push: { rating: "$_id", count: "$count" }, // Lưu lại chi tiết từng mức sao
              },
            },
          },
          { $project: { _id: 0 } }, // Loại bỏ _id: null ngay từ database
        ]),
      ]);

      // 4. Xử lý kết quả trả về từ Order
      let summaryData;
      if (orderResult.length > 0) {
        summaryData = orderResult[0]; // Gán thẳng phần tử đầu tiên
      } else {
        summaryData = { totalRevenue: 0, totalOrders: 0 };
      }
      // Xóa field _id mặc định của bước $group
      delete summaryData._id;

      // 5. Gán thêm số lượng  vào object kết quả
      summaryData.totalReviews = totalReviews;
      summaryData.totalBlogs = totalBlogs;
      summaryData.topDiscounts = topDiscounts;
      summaryData.topBlogs = topBlogs;
      summaryData.ReviewRating = ReviewRating;

      return res.status(200).json({
        success: true,
        data: summaryData,
      });
    } catch (error) {
      console.error("Lỗi lấy thống kê dashboard:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy dữ liệu thống kê",
      });
    }
  },
};

module.exports = saleDashboardController;
