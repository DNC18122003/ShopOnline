const Order = require("../models/Order/Order");
const Cpu = require("../models/Products/CPU");
const Gpu = require("../models/Products/GPU");
const Ram = require("../models/Products/RAM");
const Mainboard = require("../models/Products/Mainboard");
const Product = require("../models/Products/Product");

const productModels = {
  Cpu,
  Gpu,
  Ram,
  Mainboard,
  Product,
};

const releaseReservedStock = async () => {
  const expiredOrders = await Order.find({
    paymentMethod: "MOMOPAY",
    paymentStatus: "unpaid",
    orderStatus: "pending",
    reservationExpiresAt: { $lt: new Date() },
  });

  for (const order of expiredOrders) {
    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: order._id,
        paymentStatus: "unpaid",
        orderStatus: "pending",
      },
      {
        $set: { orderStatus: "cancelled" },
      },
      { new: true }
    );

    if (!updatedOrder) continue;

    for (const item of order.items) {
      const Model = productModels[item.productType];

      if (!Model) continue;

      await Model.findByIdAndUpdate(item.productId, {
        $inc: { reservedStock: -item.quantity },
      });
    }
  }

  console.log("Expired reservations released:", expiredOrders.length);
};

module.exports = releaseReservedStock;
