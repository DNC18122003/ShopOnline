const Order = require("../models/Order/Order");
const Product = require("../models/Products/Product");
const Category = require("../models/Category/Category");
const Brand = require("../models/Brands/Brand");

// GET /api/dashboard/staff
const getStaffDashboardData = async (req, res) => {
  try {
    // 1. Get total counts using Promise.all for parallel execution
    const [totalOrders, totalProducts, totalCategories, totalBrands] =
      await Promise.all([
        Order.countDocuments(),
        Product.countDocuments(),
        Category.countDocuments(),
        Brand.countDocuments(),
      ]);

    // 2. Get recent orders (top 5)
    // Assuming 'orderStatus', 'finalAmount', 'createdAt', and customer's details exist
    const recentOrdersQuery = await Order.find()
      .populate("customerId", "fullName") // get customer name
      .sort({ createdAt: -1 })
      .limit(5)
      .select("orderCode customerId finalAmount orderStatus createdAt paymentStatus"); // select only needed fields

    // Map the database order object to the format required by the frontend
    const recentOrders = recentOrdersQuery.map((order) => {
      // Logic for status colors
      let statusColor = "bg-gray-100 text-gray-800";
      if (order.orderStatus === "pending" || order.orderStatus === "confirmed") {
        statusColor = "bg-yellow-100 text-yellow-800";
      } else if (order.orderStatus === "shipping") {
        statusColor = "bg-blue-100 text-blue-800";
      } else if (order.orderStatus === "delivered" || order.orderStatus === "completed") {
        statusColor = "bg-green-100 text-green-800";
      } else if (order.orderStatus === "cancelled" || order.orderStatus === "delivery_failed" || order.orderStatus === "returned") {
        statusColor = "bg-red-100 text-red-800";
      }

      return {
        id: order.orderCode || order._id.toString().substring(0, 8),
        customer: order.customerId?.fullName || "Khách Vãng Lai",
        date: order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : "N/A",
        total: order.finalAmount ? `${order.finalAmount.toLocaleString("vi-VN")}đ` : "0đ",
        status: order.orderStatus || "N/A",
        statusColor: statusColor,
      };
    });

    // 3. Get low stock products (e.g., stock < 10)
    const lowStockThreshold = 10;
    const lowStockQuery = await Product.find({ stock: { $lt: lowStockThreshold } })
      .limit(10)
      .select("name stock price");

    const lowStockProducts = lowStockQuery.map((product) => ({
      id: product._id,
      name: product.name,
      sku: product._id.toString().substring(0, 8),
      stock: product.stock || 0,
      price: product.price ? `${product.price.toLocaleString("vi-VN")}đ` : "0đ",
    }));

    // Return the aggregated response object
    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalOrders,
          totalProducts,
          totalCategories,
          totalBrands,
        },
        recentOrders,
        lowStockProducts,
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu Staff Dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ nội bộ. Vui lòng thử lại sau.",
      error: error.message,
    });
  }
};

module.exports = {
  getStaffDashboardData,
};
