// controllers/admin/dashboard.controller.js

const Product = require("../../models/Products/Product");
const Category = require("../../models/Category/Category");
const Brand = require("../../models/Brands/Brand");
const Discount = require("../../models/Discounts/Discount");
const Order = require("../../models/Order/Order");

exports.getDashboard = async (req, res) => {
  try {
    // tổng số
    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalBrands = await Brand.countDocuments();
    const totalDiscounts = await Discount.countDocuments();

    // tổng doanh thu
   const totalRevenueAgg = await Order.aggregate([
     {
       $match: {
         orderStatus: { $in: ["completed"] },
       },
     },
     {
       $group: {
         _id: null,
         totalRevenue: { $sum: "$finalAmount" },
       },
     },
   ]);

   const totalRevenue = totalRevenueAgg[0]?.totalRevenue || 0;

   const totalOrders = await Order.countDocuments();


    // đơn hàng gần đây
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("customerId", "userName email");

    // sản phẩm sắp hết hàng
    const lowStockProducts = await Product.find({ stock: { $lt: 5 } })
      .select("name stock price images")
      .limit(5);

    // top selling products
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          sold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { sold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          name: "$product.name",
          price: "$product.price",
          images: "$product.images",
          sold: 1,
        },
      },
    ]);
    //chart
    const revenueChart = await Order.aggregate([
      {
        $match: { orderStatus: "completed" },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$finalAmount" },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          month: {
            $concat: ["Tháng ", { $toString: "$_id" }],
          },
          revenue: 1,
          _id: 0,
        },
      },
    ]);

    const paymentChart = await Order.aggregate([
      {
        $group: {
          _id: "$paymentMethod",
          value: { $sum: 1 },
        },
      },
      {
        $project: {
          method: "$_id",
          value: 1,
          _id: 0,
        },
      },
    ]);

    const orderChart = await Order.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          orders: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          date: "$_id",
          orders: 1,
          _id: 0,
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCategories,
        totalBrands,
        totalDiscounts,
        recentOrders,
        lowStockProducts,
        topProducts,
        revenueChart,
        paymentChart,
        orderChart,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Dashboard error",
    });
  }
};
