const OrderAssignment = require("../models/Order/OrderAssignment");
const { assignOrderToSale } = require("../utils/assignment");

const checkTimeoutAssignments = async () => {
  try {
    const timeoutLimit = new Date(Date.now() - 1 * 60 * 1000);

    const stagnantAssignments = await OrderAssignment.find({
      status: "waiting",
      assignedAt: { $lte: timeoutLimit },
    });

    console.log("[TIMEOUT CHECK]", stagnantAssignments.length);

    for (const a of stagnantAssignments) {
      const oldSale = a.saleId;

     const newHistory = Array.from(
       new Set([...a.historySales.map(String), oldSale.toString()])
     );

      await OrderAssignment.updateOne(
        { _id: a._id },
        {
          status: "timeout",
          $inc: { reassignCount: 1 },
        }
      );

      await assignOrderToSale(a.orderId, newHistory);

      console.log("Timeout -> reassign order:", a.orderId);
    }
  } catch (error) {
    console.error("Timeout error:", error);
  }
};

module.exports = checkTimeoutAssignments;
