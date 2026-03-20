const OrderAssignment = require("../models/OrderAssignment");
const { assignOrderToSale } = require("../services/assignment.service");

const checkTimeoutAssignments = async () => {
  const timeout = new Date(Date.now() - 5 * 60 * 1000);

  const assignments = await OrderAssignment.find({
    status: "waiting",
    assignedAt: { $lte: timeout },
  });

  for (const a of assignments) {
    a.status = "timeout";
    a.historySales.push(a.saleId);
    a.reassignCount += 1;

    await a.save();

    await assignOrderToSale(a.orderId, a.historySales);
  }
};

module.exports = checkTimeoutAssignments;
