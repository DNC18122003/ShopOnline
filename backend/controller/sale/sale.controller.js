const OrderAssignment = require("../../models/Order/OrderAssignment");

const acceptOrder = async (req, res) => {
  try {
    const saleId = req.user._id;
    const { orderId } = req.params;

    const assignment = await OrderAssignment.findOne({
      orderId,
      saleId,
      status: "waiting",
    });

    if (!assignment) return res.status(404).json({ message: "Không có đơn" });

    assignment.status = "accepted";
    assignment.acceptedAt = new Date();

    await assignment.save();

    res.json({ message: "Đã nhận đơn" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = { acceptOrder };
