const OrderAssignment = require("../models/Order/OrderAssignment");
const User = require("../models/User");

const assignOrderToSale = async (orderId, excludedSales = []) => {
  let sales = await User.find({
    role: "sale",
    isActive: "active",
    _id: { $nin: excludedSales },
  });

  // reset vòng nếu tất cả sale đã nhận
  if (!sales.length) {
    console.log("Tất cả sale đã nhận -> reset vòng assign");

    excludedSales = [excludedSales[excludedSales.length - 1]];
    // giữ lại sale cuối để tránh assign lại ngay

    sales = await User.find({
      role: "sale",
      isActive: "active",
      _id: { $nin: excludedSales },
    });
  }

  if (!sales.length) {
    console.log("Không có sale khả dụng");
    return null;
  }

  let selectedSale = null;
  let minOrders = Infinity;

  for (const sale of sales) {
    const activeOrders = await OrderAssignment.countDocuments({
      saleId: sale._id,
      status: { $in: ["waiting", "accepted"] },
    });

    if (activeOrders < minOrders) {
      minOrders = activeOrders;
      selectedSale = sale;
    }
  }

  if (!selectedSale) return null;

  const assignment = await OrderAssignment.findOneAndUpdate(
    { orderId },
    {
      saleId: selectedSale._id,
      status: "waiting",
      assignedAt: new Date(),
      historySales: [...excludedSales, selectedSale._id],
    },
    { upsert: true, new: true }
  );

  console.log("Đã gán đơn", orderId, "cho sale", selectedSale.fullName);

  return assignment;
};

module.exports = { assignOrderToSale };
