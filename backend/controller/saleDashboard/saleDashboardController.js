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
        orderRecent,
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
        Order.aggregate([
          // 1. Lọc đơn hàng trong tháng có chứa mã giảm giá (và đã thanh toán thành công)
          {
            $match: {
              createdAt: { $gte: startDate, $lt: endDate },
              paymentStatus: { $in: ["paid"] },
              discountCode: { $ne: null, $exists: true, $ne: "" },
            },
          },
          // 2. Nhóm theo mã giảm giá và đếm số lượng
          {
            $group: {
              _id: "$discountCode",
              usedCount: { $sum: 1 },
            },
          },
          // 3. Sắp xếp giảm dần và lấy top 5
          { $sort: { usedCount: -1 } },
          { $limit: 5 },
          // 4. JOIN sang bảng discounts để lấy thông tin value và discountType
          {
            $lookup: {
              from: "discounts",
              localField: "_id",
              foreignField: "code",
              as: "discountInfo",
            },
          },
          // 5. Giải nén mảng (bắt buộc sau khi dùng lookup)
          { $unwind: "$discountInfo" },
          // 6. Định dạng lại cấu trúc JSON trả về cho giống FE
          {
            $project: {
              _id: 0,
              code: "$_id",
              usedCount: 1,
              discountType: "$discountInfo.discountType",
              value: "$discountInfo.value",
            },
          },
        ]),
        Blog.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lt: endDate },
              status: "published",
            },
          },
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
        Order.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lt: endDate },
            },
          },
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          {
            // Chọn các trường muốn trả về
            $project: {
              paymentMethod: 1,
              paymentStatus: 1,
              orderStatus: 1,
              orderCode: 1,
              createdAt: 1,
            },
          },
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
      summaryData.orderRecent = orderRecent;

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
