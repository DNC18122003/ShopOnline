const OrderAssignment = require("../models/Order/OrderAssignment");
const User = require("../models/User");

const assignOrderToSale = async (orderId, excludedSales = []) => {
  const sales = await User.find({
    role: "sale",
    isActive: true,
    _id: { $nin: excludedSales },
  });

  if (!sales.length) return null;

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

  const assignment = await OrderAssignment.create({
    orderId,
    saleId: selectedSale._id,
  });

  return assignment;
};

module.exports = { assignOrderToSale };
