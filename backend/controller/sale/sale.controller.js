const OrderAssignment = require("../../models/Order/OrderAssignment");
const Order = require("../../models/Order/Order");
const { assignOrderToSale } = require("../../utils/assignment");
// 1. Lấy danh sách các đơn hàng ĐANG CHỜ (hệ thống mới gán, chưa bấm nhận)

const getPendingAssignments = async (req, res) => {
  try {
    const saleId = req.user._id;

    const pending = await OrderAssignment.find({
      saleId,
      status: "waiting",
    })
      .populate({
        path: "orderId",
        select: "orderCode shippingAddress finalAmount paymentMethod createdAt",
      })
      .sort({ assignedAt: -1 });

    res.json(pending);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};


// 2. Chấp nhận đơn hàng (Hàm của bạn đã tối ưu hơn)

const acceptOrder = async (req, res) => {
  try {
    const saleId = req.user._id;
    const { orderId } = req.params;

    const assignment = await OrderAssignment.findOne({
      orderId,
      saleId,
      status: "waiting",
    });

    if (!assignment) {
      return res
        .status(404)
        .json({
          message:
            "Đơn hàng không còn ở trạng thái chờ hoặc không thuộc về bạn",
        });
    }

    assignment.status = "accepted";
    assignment.acceptedAt = new Date();
    await assignment.save();

    // Cập nhật trạng thái đơn hàng sang 'confirmed' ngay khi sale nhận đơn
    await Order.findByIdAndUpdate(orderId, { orderStatus: "confirmed" });

    res.json({
      message: "Đã nhận và xác nhận đơn hàng thành công",
      assignment,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// 3. Từ chối đơn hàng (Để hệ thống gán cho người khác)
 
const rejectOrder = async (req, res) => {
  try {
    const saleId = req.user._id;
    const { orderId } = req.params;

    const assignment = await OrderAssignment.findOne({
      orderId,
      saleId,
      status: "waiting",
    });

    if (!assignment) {
      return res.status(404).json({
        message: "Không tìm thấy lượt phân công này",
      });
    }

    assignment.status = "rejected";

    if (!assignment.historySales.includes(saleId)) {
      assignment.historySales.push(saleId);
    }

    await assignment.save();

    // gán cho sale khác
    await assignOrderToSale(orderId, assignment.historySales);

    res.json({
      message: "Đã từ chối đơn hàng, hệ thống đang gán cho sale khác",
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// 4. Lấy danh sách đơn hàng Sale ĐANG XỬ LÝ (đã nhận và chưa hoàn thành)
 
const getMyProcessingOrders = async (req, res) => {
  try {
    const saleId = req.user._id;

    // Tìm các assignment đã accept
    const assignments = await OrderAssignment.find({
      saleId,
      status: "accepted",
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
  getPendingAssignments,
  acceptOrder,
  rejectOrder,
  getMyProcessingOrders,
};
