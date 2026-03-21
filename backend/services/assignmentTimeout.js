const OrderAssignment = require("../models/Order/OrderAssignment");
const { assignOrderToSale } = require("../utils/assignment");

const checkTimeoutAssignments = async () => {
  try {
    // 1. Tạo mốc thời gian cách đây 1 phút
    const timeoutLimit = new Date(Date.now() - 1 * 60 * 1000);

    // 2. Tìm đơn thỏa mãn (CHÚ Ý: ĐƠN TRONG DB PHẢI LÀ 'waiting')
    const stagnantAssignments = await OrderAssignment.find({
      status: "waiting", // Nếu trong DB bạn là "timeout" rồi thì nó sẽ không tìm thấy đâu
      assignedAt: { $lte: timeoutLimit },
    }).populate("saleId", "fullName userName");

    // LOG QUAN TRỌNG: Nếu số này bằng 0, nghĩa là không có đơn nào khớp điều kiện
    console.log(
      `[TIMEOUT CHECK] Tìm thấy: ${stagnantAssignments.length} đơn chờ xử lý.`
    );

    if (stagnantAssignments.length === 0) return;

    for (const a of stagnantAssignments) {
      const oldSaleName =
        a.saleId?.fullName || a.saleId?.userName || "Không xác định";
      const oldSaleId = a.saleId?._id;

      // Cập nhật trạng thái cũ để không bị quét lặp lại
      await OrderAssignment.updateOne(
        { _id: a._id },
        {
          status: "timeout",
          $inc: { reassignCount: 1 },
        }
      );

      const newHistory = [...a.historySales, oldSaleId];

      // Gọi hàm gán lại
      await assignOrderToSale(a.orderId, newHistory);

      console.log(`--------------------------------------------------`);
      console.log(`[TIMEOUT SUCCESS] Thu hồi đơn: ${a.orderId}`);
      console.log(`[TIMEOUT SUCCESS] Từ Sale: ${oldSaleName}`);
      console.log(`--------------------------------------------------`);
    }
  } catch (error) {
    console.error("[TIMEOUT ERROR]:", error.message);
  }
};

module.exports = checkTimeoutAssignments;
