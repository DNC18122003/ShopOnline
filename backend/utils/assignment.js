const OrderAssignment = require("../models/Order/OrderAssignment");
const User = require("../models/User");

const assignOrderToSale = async (orderId) => {
  const sales = await User.find({
    role: "sale",
    isActive: "active",
  });

  if (!sales.length) {
    console.log("Không có sale khả dụng");
    return null;
  }

  let selectedSale = null;
  let minOrders = Infinity;

  for (const sale of sales) {
    const activeOrders = await OrderAssignment.countDocuments({
      saleId: sale._id,
      status: "assigned",
    });

    if (activeOrders < minOrders) {
      minOrders = activeOrders;
      selectedSale = sale;
    }
  }

  if (!selectedSale) return null;

  const assignment = await OrderAssignment.create({
    orderId,
    saleId: selectedSale._id,
    status: "assigned",
    assignedAt: new Date(),
  });

  console.log("Đã gán đơn", orderId, "cho sale", selectedSale.fullName);

  return assignment;
};

module.exports = { assignOrderToSale };
