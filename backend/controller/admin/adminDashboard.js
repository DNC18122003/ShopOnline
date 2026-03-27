// controllers/admin/dashboard.controller.js

const Product = require("../../models/Products/Product");
const Category = require("../../models/Category/Category");
const Brand = require("../../models/Brands/Brand");
const Discount = require("../../models/Discounts/Discount");
const Order = require("../../models/Order/Order");
const Cpu = require("../../models/Products/CPU");
const Gpu = require("../../models/Products/GPU");
const Ram = require("../../models/Products/RAM");
const Mainboard = require("../../models/Products/Mainboard");

exports.getDashboard = async (req, res) => {
  try {
    // tổng số
   
    const [totalCpu, totalGpu, totalRam, totalMainboard, totalProduct] =
      await Promise.all([
        Cpu.countDocuments(),
        Gpu.countDocuments(),
        Ram.countDocuments(),
        Mainboard.countDocuments(),
        Product.countDocuments(),
      ]);

    const totalProducts =
      totalCpu + totalGpu + totalRam + totalMainboard + totalProduct;
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
  const lowStockProducts = [
    ...(await Cpu.find({ stock: { $lt: 5 } })),
    ...(await Gpu.find({ stock: { $lt: 5 } })),
    ...(await Ram.find({ stock: { $lt: 5 } })),
    ...(await Mainboard.find({ stock: { $lt: 5 } })),
    ...(await Product.find({ stock: { $lt: 5 } })),
  ]
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);

    // top selling products
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },

      {
        $group: {
          _id: {
            productId: "$items.productId",
            productType: "$items.productType",
            name: "$items.nameSnapshot",
            image: "$items.imageSnapshot",
            price: "$items.priceSnapshot",
          },
          sold: { $sum: "$items.quantity" },
        },
      },

      { $sort: { sold: -1 } },

      { $limit: 5 },

      {
        $project: {
          _id: 0,
          productId: "$_id.productId",
          productType: "$_id.productType",
          name: "$_id.name",
          images: ["$_id.image"],
          price: "$_id.price",
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
