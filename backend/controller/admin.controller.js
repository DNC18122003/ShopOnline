const Order = require("../models/Order/Order");
const getTotalOrder = async (req, res) => {
    // trả về số lượng đơn hàng đã hoàn thành
    try {
        const totalCompletedOrders = await Order.countDocuments({
            orderStatus: "completed"
        });

        res.status(200).json({
            success: true,
            totalCompletedOrders
        });

    } catch (error) {
        console.error("Error getting total orders:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy tổng số đơn hàng"
        });
    }
};

module.exports = { getTotalOrder };