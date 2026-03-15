const Order = require("../models/Order/Order");
const Product = require("../models/Products/Product");
const Category = require("../models/Category/Category");
const Brand = require("../models/Brands/Brand");

// GET /api/dashboard/staff
const getStaffDashboardData = async (req, res) => {
  try {
    // 1. Tính tổng số lượng
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalBrands = await Brand.countDocuments();

    // 2. Lấy 5 đơn hàng mới nhất
    const latestOrders = await Order.find()
      .populate("customerId", "fullName") // Lấy tên khách hàng
      .sort({ createdAt: -1 }) // Sắp xếp giảm dần theo ngày
      .limit(5); // Chỉ lấy 5 đơn

    // Tiền xử lý dữ liệu đơn hàng trả về cho dễ dùng ở frontend
    const recentOrdersFormatted = [];
    for (let order of latestOrders) {
      // Phân logic màu sắc trạng thái
      let statusColor = "bg-gray-100 text-gray-800";
      if (order.orderStatus === "pending") statusColor = "bg-yellow-100 text-yellow-800";
      if (order.orderStatus === "shipping") statusColor = "bg-blue-100 text-blue-800";
      if (order.orderStatus === "delivered" || order.orderStatus === "completed") statusColor = "bg-green-100 text-green-800";
      if (["cancelled", "delivery_failed", "returned"].includes(order.orderStatus)) statusColor = "bg-red-100 text-red-800";

      recentOrdersFormatted.push({
        id: order.orderCode || order._id,
        customer: order.customerId ? order.customerId.fullName : "Khách Vãng Lai",
        date: order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : "N/A",
        total: order.finalAmount ? order.finalAmount.toLocaleString("vi-VN") + "đ" : "0đ",
        status: order.orderStatus,
        statusColor: statusColor,
      });
    }

    // 3. Lấy sản phẩm sắp hết hàng (số lượng < 10)
    const lowStockThreshold = 10;
    const productsLowStock = await Product.find({ stock: { $lt: lowStockThreshold } })
      .limit(10); // Lấy tối đa 10 sản phẩm

    // Tiền xử lý dữ liệu sản phẩm
    const lowStockProductsFormatted = [];
    for (let product of productsLowStock) {
      lowStockProductsFormatted.push({
        id: product._id,
        name: product.name,
        sku: product._id.toString().substring(0, 8),
        stock: product.stock,
        price: product.price ? product.price.toLocaleString("vi-VN") + "đ" : "0đ",
      });
    }

    // Trả về kết quả
    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalOrders: totalOrders,
          totalProducts: totalProducts,
          totalCategories: totalCategories,
          totalBrands: totalBrands,
        },
        recentOrders: recentOrdersFormatted,
        lowStockProducts: lowStockProductsFormatted,
      },
    });

  } catch (error) {
    console.error("Lỗi API Dashboard:", error);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi trên server",
    });
  }
};

module.exports = {
  getStaffDashboardData,
};
