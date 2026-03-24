const OrderAssignment = require("../../models/Order/OrderAssignment");
const Order = require("../../models/Order/Order");
const { assignOrderToSale } = require("../../utils/assignment");
//  Lấy danh sách các đơn hàng ĐANG CHỜ 

const getMySaleOrders = async (req, res) => {
  try {
    const saleId = req.user._id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const assignments = await OrderAssignment.find({
      saleId,
    }).select("orderId");

    const orderIds = assignments.map((a) => a.orderId);

    const total = await Order.countDocuments({
      _id: { $in: orderIds },
    });

    const orders = await Order.find({
      _id: { $in: orderIds },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//  Lấy danh sách đơn hàng Sale ĐANG XỬ LÝ (đã nhận và chưa hoàn thành)
 
const getMyProcessingOrders = async (req, res) => {
  try {
    const saleId = req.user._id;

    // Tìm các assignment đã accept
    const assignments = await OrderAssignment.find({
      saleId,
      status: "processing",
    }).select("orderId");

    const orderIds = assignments.map((a) => a.orderId);

    // Lấy thông tin chi tiết đơn hàng (loại trừ các đơn đã hoàn thành hoặc đã hủy)
    const orders = await Order.find({
      _id: { $in: orderIds },
      orderStatus: { $nin: ["completed", "cancelled", "returned"] },
    }).sort({ updatedAt: -1 });

    res.json(orders);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = {
  getMySaleOrders,
  getMyProcessingOrders,
};
