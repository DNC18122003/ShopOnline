const Order = require("../models/Order/Order");
const Product = require("../models/Products/Product");

const releaseReservedStock = async () => {
  const expiredOrders = await Order.find({
    paymentMethod: "MOMOPAY",
    paymentStatus: "unpaid",
    reservationExpiresAt: { $lt: new Date() },
  });

  for (const order of expiredOrders) {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { reservedStock: -item.quantity },
      });
    }

    order.orderStatus = "cancelled";
    await order.save();
  }

  console.log("Expired reservations released:", expiredOrders.length);
};

module.exports = releaseReservedStock;
