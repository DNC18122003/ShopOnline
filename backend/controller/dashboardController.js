const Order = require("../models/Order/Order");
const Product = require("../models/Products/Product");
const Category = require("../models/Category/Category");
const Brand = require("../models/Brands/Brand");

// GET /api/dashboard/staff
const getStaffDashboardData = async (req, res) => {
  try {
    // 1. Tính tổng số lượng
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalCategories = await Category.countDocuments();
    const totalBrands = await Brand.countDocuments();

    // 2. Lấy 5 sản phẩm mới nhất
    const latestProducts = await Product.find()
      .populate("category", "name")
      .populate("brand", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    const latestProductsFormatted = latestProducts.map(product => ({
      id: product._id,
      name: product.name,
      sku: product._id.toString().substring(0, 8),
      date: product.createdAt ? new Date(product.createdAt).toLocaleDateString("vi-VN") : "N/A",
      price: product.price ? product.price.toLocaleString("vi-VN") + "đ" : "0đ",
      isActive: product.isActive,
      category: product.category ? product.category.name : "N/A",
    }));

    // 3. Lấy sản phẩm sắp hết hàng (số lượng < 10)
    const lowStockThreshold = 10;
    const productsLowStock = await Product.find({ stock: { $lt: lowStockThreshold } })
      .limit(10); // Lấy tối đa 10 sản phẩm

    // Tiền xử lý dữ liệu sản phẩm
    const lowStockProductsFormatted = productsLowStock.map(product => ({
      id: product._id,
      name: product.name,
      sku: product._id.toString().substring(0, 8),
      stock: product.stock,
      price: product.price ? product.price.toLocaleString("vi-VN") + "đ" : "0đ",
    }));

    // Trả về kết quả
    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalProducts: totalProducts,
          totalCategories: totalCategories,
          totalBrands: totalBrands,
        },
        latestProducts: latestProductsFormatted,
        lowStockProducts: lowStockProductsFormatted,
      },
    });

  } catch (error) {
    console.error("Lỗi API Dashboard Staff:", error);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi trên server",
    });
  }
};

module.exports = {
  getStaffDashboardData,
};
