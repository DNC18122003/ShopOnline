const crypto = require("crypto");
const axios = require("axios");

const Order = require("../../models/order/Order");
const Product = require("../../models/Products/Product");
const Cart = require("../../models/order/Cart");

const momoConfig = {
  partnerCode: process.env.MOMO_PARTNER_CODE || "MOMO",
  accessKey: process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85",
  secretKey: process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz",
  endpoint: "https://test-payment.momo.vn/v2/gateway/api/create",
  redirectUrl: "http://localhost:5173/payment-result",
  ipnUrl: "https://example.com/ipn",
};


exports.createMomoPayment = async (order) => {
  try {
    const requestId = momoConfig.partnerCode + Date.now();
    const orderId = order._id.toString();
    const amount = order.finalAmount.toString();
    const orderInfo = `Thanh toán đơn hàng ${order.orderCode}`;
    const extraData = "";
    const requestType = "captureWallet";

    const rawSignature =
      `accessKey=${momoConfig.accessKey}` +
      `&amount=${amount}` +
      `&extraData=${extraData}` +
      `&ipnUrl=${momoConfig.ipnUrl}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&partnerCode=${momoConfig.partnerCode}` +
      `&redirectUrl=${momoConfig.redirectUrl}` +
      `&requestId=${requestId}` +
      `&requestType=${requestType}`;

    const signature = crypto
      .createHmac("sha256", momoConfig.secretKey)
      .update(rawSignature)
      .digest("hex");

    const requestBody = {
      partnerCode: momoConfig.partnerCode,
      accessKey: momoConfig.accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl: momoConfig.redirectUrl,
      ipnUrl: momoConfig.ipnUrl,
      extraData,
      requestType,
      signature,
      lang: "vi",
    };

    const response = await axios.post(momoConfig.endpoint, requestBody);

    if (response.data.resultCode !== 0) {
      throw new Error(response.data.message || "MoMo create failed");
    }

    return response.data.payUrl;
  } catch (error) {
    console.error("Create MoMo payment error:", error.message);
    throw error;
  }
};


exports.confirmMomoPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    //  Update atomic: chỉ update nếu chưa paid
    const order = await Order.findOneAndUpdate(
      { _id: orderId, paymentStatus: "unpaid" },
      {
        $set: {
          paymentStatus: "paid",
          orderStatus: "confirmed",
        },
      },
      { new: true }
    );

    if (!order) {
      return res.json({ message: "Already paid or not found" });
    }

    //  Trừ stock chỉ khi update thành công
    for (const item of order.items) {
      await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } }
      );
    }

    //  Xóa khỏi cart
    await Cart.updateOne(
      { userId: order.customerId },
      {
        $pull: {
          items: {
            productId: {
              $in: order.items.map((item) => item.productId),
            },
          },
        },
      }
    );

    return res.json({ success: true });
  } catch (error) {
    console.error("Confirm momo payment error:", error);
    return res.status(500).json({ message: "Confirm failed" });
  }
};