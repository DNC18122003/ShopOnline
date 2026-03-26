const crypto = require("crypto");
const axios = require("axios");
const mongoose = require("mongoose");
const Order = require("../../models/Order/Order");
const Product = require("../../models/Products/Product");
const Cart = require("../../models/Order/Cart");
const { assignOrderToSale } = require("../../utils/assignment");

const momoConfig = {
  partnerCode: process.env.MOMO_PARTNER_CODE || "MOMO",
  accessKey: process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85",
  secretKey: process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz",
  endpoint: "https://test-payment.momo.vn/v2/gateway/api/create",
  redirectUrl: "http://localhost:5173/payment-result",
  ipnUrl: "https://example.com/ipn",
};
const getModelByType = (type) => {
  switch ((type || "").toLowerCase()) {
    case "cpu":
      return mongoose.model("Cpu");
    case "gpu":
      return mongoose.model("Gpu");
    case "ram":
      return mongoose.model("Ram");
    case "mainboard":
      return mongoose.model("Mainboard");
    default:
      return mongoose.model("Product");
  }
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
        $push: {
          statusLogs: {
            status: "confirmed",
            note: "Thanh toán MoMo thành công",
          },
        },
      },
      { new: true }
    );

    if (!order) {
      return res.json({ message: "Already paid or not found" });
    }

    //  Trừ stock chỉ khi update thành công
    for (const item of order.items) {
      try {
        const Model = getModelByType(item.productType); // lấy đúng model
        if (!Model) {
          throw new Error(
            `Unknown productType: ${item.productType} (productId: ${item.productId})`
          );
        }
        await Model.findByIdAndUpdate(item.productId, {
          $inc: {
            stock: -item.quantity,
            reservedStock: -item.quantity,
          },
        });
      } catch (err) {
        console.error(`Error updating product ${item.productId}:`, err);
        throw err; // để backend trả 500 và log chi tiết
      }
    }
    await assignOrderToSale(order._id); // handle by sale

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

exports.cancelMomoPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    // update order trước (atomic)
    const order = await Order.findOneAndUpdate(
      {
        _id: orderId,
        paymentMethod: "MOMOPAY",
        paymentStatus: "unpaid",
        orderStatus: "pending",
      },
      {
        $set: { orderStatus: "cancelled" },
        $push: {
          statusLogs: {
            status: "cancelled",
            note: "MoMo payment cancelled",
          },
        },
      },
      { new: true }
    );

    if (!order) {
      return res.json({
        message: "Order không tồn tại hoặc đã xử lý",
      });
    }

    // release reserved stock
   for (const item of order.items) {
     try {
       const Model = getModelByType(item.productType);
       if (!Model) {
         throw new Error(
           `Unknown productType: ${item.productType} (productId: ${item.productId})`
         );
       }
       await Model.findByIdAndUpdate(item.productId, {
         $inc: { reservedStock: -item.quantity },
       });
     } catch (err) {
       console.error(`Error releasing product ${item.productId}:`, err);
       throw err; // để backend log chi tiết
     }
   }

    return res.json({
      success: true,
      message: "Đã huỷ giao dịch và trả lại hàng",
    });
  } catch (error) {
    console.error("Cancel momo payment error:", error);
    return res.status(500).json({
      message: "Huỷ thanh toán thất bại",
    });
  }
};
