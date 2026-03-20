const Order = require("../models/Order/Order");
const Product = require("../models/Products/Product");
const mongoose = require("mongoose");
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
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { reservedStock: -item.quantity },
      });
    }
  }

  console.log("Expired reservations released:", expiredOrders.length);
};

module.exports = releaseReservedStock;
