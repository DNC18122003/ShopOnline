const Order = require("../../models/Order/Order");
const Cart = require("../../models/Order/Cart");
const Product = require("../../models/Products/Product");
const Cpu = require("../../models/Products/CPU");
const Gpu = require("../../models/Products/GPU");
const Ram = require("../../models/Products/RAM");
const Mainboard = require("../../models/Products/Mainboard");
const Discount = require("../../models/Discounts/Discount");
const { createMomoPayment } = require("./momo.controller");
const mongoose = require("mongoose");
const User = require("../../models/User");
const Review = require("../../models/order/Review");
const { assignOrderToSale } = require("../../utils/assignment");
const OrderAssignment = require("../../models/Order/OrderAssignment");

const statusFlow = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipping"],
  shipping: ["delivered", "delivery_failed"],
  delivered: ["completed", "returned"],
};

const PRODUCT_MODELS = [Product, Cpu, Gpu, Ram, Mainboard];

const findProductAcrossModels = async (id) => {
  for (const model of PRODUCT_MODELS) {
    const product = await model.findById(id).lean();
    if (product) return { product, model };
  }
  return null;
};

const getModelByType = (type) => {
  switch ((type || "").toLowerCase()) {
    case "cpu":
      return Cpu;
    case "gpu":
      return Gpu;
    case "ram":
      return Ram;
    case "mainboard":
      return Mainboard;
    default:
      return Product;
  }
};

const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }
    const {
      shippingAddress,
      paymentMethod = "COD",
      discountCode,
      selectedProductIds,
      items,
    } = req.body;

    const finalShippingAddress = {
      fullName: shippingAddress?.fullName || user.fullName,
      phone: shippingAddress?.phone || user.phone,
      email: shippingAddress?.email || user.email,
      street: shippingAddress?.street || user.address?.street,
      ward: shippingAddress?.ward || user.address?.ward,
      province: shippingAddress?.province || user.address?.province,
      note: shippingAddress?.note || user.address?.note,
    };
    // VALIDATION
    if (
      !finalShippingAddress.fullName ||
      !finalShippingAddress.phone ||
      !finalShippingAddress.province ||
      !finalShippingAddress.ward ||
      !finalShippingAddress.street
    ) {
      return res.status(400).json({
        message: "Thiếu thông tin địa chỉ giao hàng bắt buộc",
      });
    }

    if (!["COD", "MOMOPAY"].includes(paymentMethod)) {
      return res
        .status(400)
        .json({ message: "Phương thức thanh toán không hợp lệ" });
    }
    // LẤY ITEMS (BUY NOW / CART)
    let itemsToCheckout = [];

    if (items?.length > 0) {
      // BUY NOW
      itemsToCheckout = items;
    } else {
      // CHECKOUT CART
      const cart = await Cart.findOne({ userId }).lean();
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Giỏ hàng trống" });
      }

      itemsToCheckout = selectedProductIds?.length
        ? cart.items.filter((item) =>
            selectedProductIds.includes(item.productId.toString())
          )
        : cart.items;
    }

    if (itemsToCheckout.length === 0) {
      return res.status(400).json({ message: "Không có sản phẩm được chọn" });
    }

    // CHECK STOCK & BUILD ORDER ITEMS
    let subtotal = 0;
    const orderItems = [];

    for (const cartItem of itemsToCheckout) {
      const found = await findProductAcrossModels(cartItem.productId);
      const product = found?.product;

      if (!product) {
        return res.status(400).json({
          message: `Không tìm thấy sản phẩm "${cartItem.nameSnapshot}" trong hệ thống`,
        });
      }

      if (!product.isActive) {
        return res.status(400).json({
          message: `Sản phẩm "${cartItem.nameSnapshot}" đã bị khóa`,
        });
      }

      const availableStock = product.stock - (product.reservedStock || 0);

      if (paymentMethod === "MOMOPAY") {
        if (availableStock < cartItem.quantity) {
          return res.status(400).json({
            message: `Sản phẩm "${product.name}" đang được giữ bởi đơn hàng khác`,
          });
        }
      } else {
        if (product.stock < cartItem.quantity) {
          return res.status(400).json({
            message: `Số lượng không đủ`,
          });
        }
      }

      if (!cartItem.quantity || cartItem.quantity <= 0) {
        return res.status(400).json({
          message: "Số lượng không hợp lệ",
        });
      }

      if (product.stock === 0) {
        return res.status(400).json({
          message: `Sản phẩm "${product.name}" đã hết hàng`,
        });
      }

      const itemTotal = cartItem.quantity * cartItem.priceSnapshot;
      subtotal += itemTotal;

      const productTypeMap = {
        cpu: "Cpu",
        gpu: "Gpu",
        ram: "Ram",
        mainboard: "Mainboard",
        product: "Product",
      };

      const normalizedProductType = productTypeMap[(cartItem.productType || "").toLowerCase()] || found?.model?.modelName || "Product";

      orderItems.push({
        productId: cartItem.productId,
        productType: normalizedProductType,
        nameSnapshot: cartItem.nameSnapshot,
        imageSnapshot: cartItem.imageSnapshot,
        priceSnapshot: cartItem.priceSnapshot,
        quantity: cartItem.quantity,
      });
    }

    //  DISCOUNT
    let discountAmount = 0;
    let appliedDiscountCode = null;

    if (discountCode) {
      const now = new Date();

      const discount = await Discount.findOne({
        code: discountCode.toUpperCase(),
        status: "active",
        validFrom: { $lte: now },
        expiredAt: { $gte: now },
        usageLimit: { $gt: 0 },
      });

      if (!discount) {
        return res.status(400).json({
          message: "Mã giảm giá không tồn tại, đã hết hạn hoặc bị vô hiệu hóa",
        });
      }

      if (subtotal < discount.minOrderValue) {
        return res.status(400).json({
          message: `Đơn hàng tối thiểu phải từ ${discount.minOrderValue.toLocaleString()}đ để áp dụng mã`,
        });
      }

      let calculatedDiscount = 0;

      if (discount.discountType === "percent") {
        calculatedDiscount = subtotal * (discount.value / 100);
      } else if (discount.discountType === "fixed") {
        calculatedDiscount = discount.value;
      }

      discountAmount = Math.min(
        calculatedDiscount,
        discount.maxDiscountValue || calculatedDiscount
      );

      appliedDiscountCode = discount.code;

      const updateUsage = await Discount.findOneAndUpdate(
        { _id: discount._id, usageLimit: { $gt: 0 } },
        {
          $inc: {
            usageLimit: -1,
            usedCount: 1,
          },
        },
        { new: true }
      );

      if (!updateUsage) {
        return res.status(400).json({
          message: "Mã giảm giá đã hết lượt sử dụng",
        });
      }
    }

    const finalAmount = Math.max(0, subtotal - discountAmount);

    // =========================
    // 5. CREATE ORDER
    // =========================
    const newOrder = new Order({
      customerId: userId,
      items: orderItems,
      subtotal,
      discountCode: appliedDiscountCode,
      discountAmount,
      finalAmount,
      shippingAddress: finalShippingAddress,
      paymentMethod,
      paymentStatus: "unpaid",
      orderStatus: "pending",
      statusLogs: [
        {
          status: "pending",
          note: "Order created",
          updatedBy: userId,
        },
      ],
    });
    
    await newOrder.save();
    if (paymentMethod === "COD") {
      await assignOrderToSale(newOrder._id);
    }

    // Giu hang trong 5
    if (paymentMethod === "MOMOPAY") {
      for (const item of orderItems) {
        const found = await findProductAcrossModels(item.productId);
        if (!found?.model) continue;

        await found.model.findByIdAndUpdate(item.productId, {
          $inc: { reservedStock: item.quantity },
        });
      }

      newOrder.reservationExpiresAt = new Date(Date.now() + 1 * 60 * 1000);
      await newOrder.save();
     
    }
    // 6. MOMO PAYMENT
    if (paymentMethod === "MOMOPAY") {
      try {
        const payUrl = await createMomoPayment(newOrder);
        return res.status(201).json({
          success: true,
          paymentUrl: payUrl,
          orderId: newOrder._id,
          order: newOrder,
        });
      } catch (err) {
        await Order.findByIdAndDelete(newOrder._id);
        return res.status(500).json({
          message: "Không thể tạo link thanh toán MoMo",
        });
      }
    }

    //  TRỪ STOCK (COD / BANK)
    for (const item of orderItems) {
      const found = await findProductAcrossModels(item.productId);
      if (!found?.model) {
        return res.status(400).json({
          message: `Không tìm thấy sản phẩm ${item.nameSnapshot} khi trừ tồn kho`,
        });
      }

      const updated = await found.model.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (!updated) {
        await Order.findByIdAndUpdate(newOrder._id, {
          orderStatus: "cancelled",
          $push: {
            statusLogs: {
              status: "cancelled",
              note: "Hết hàng lúc xác nhận",
              updatedBy: userId,
            },
          },
        });

        return res.status(400).json({
          message: `Hết hàng sản phẩm ${item.nameSnapshot}`,
        });
      }
    }

    //  XÓA CART (NẾU CHECKOUT CART)
    if (!items?.length && itemsToCheckout.length) {
      const productIdsToRemove = itemsToCheckout.map(
        (item) => new mongoose.Types.ObjectId(item.productId)
      );

      await Cart.updateOne(
        { userId },
        {
          $pull: {
            items: { productId: { $in: productIdsToRemove } },
          },
        }
      );
    }
    return res.status(201).json({
      success: true,
      message: "Tạo đơn hàng thành công!",
      order: newOrder,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({
      message: "Tạo đơn hàng thất bại",
      error: error.message,
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 5, search, status, fromDate, toDate } = req.query;

    const query = { customerId: userId };

    if (search) {
      query.orderCode = { $regex: search, $options: "i" };
    }

    if (status) {
      query.orderStatus = status;
    }

    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // 🔥 lấy tất cả review của user
    const reviews = await Review.find({
      userId,
      isActive: true,
    }).lean();

    // 🔥 gắn review status vào order
    const ordersWithReview = orders.map((order) => {
      const items = order.items.map((item) => {
        const reviewed = reviews.some(
          (r) =>
            r.orderId.toString() === order._id.toString() &&
            r.productId.toString() === item.productId.toString()
        );

        return {
          ...item,
          reviewed,
        };
      });

      return {
        ...order,
        items,
      };
    });

    const total = await Order.countDocuments(query);

    return res.json({
      success: true,
      orders: ordersWithReview,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lấy đơn hàng thất bại",
      error: error.message,
    });
  }
};
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;
    const role = req.user.role;

    let order;

    if (role === "admin" || role === "sale") {
      order = await Order.findById(orderId).lean();
    } else {
      order = await Order.findOne({
        _id: orderId,
        customerId: userId,
      }).lean();
    }

    if (!order) {
      return res.status(404).json({
        message: "Order not found!",
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({
      message: "Get Order by Id fail",
      error: error.message,
    });
  }
};

const getAllOrder = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean();

    const total = await Order.countDocuments();

    const assignments = await OrderAssignment.find()
      .populate("saleId", "fullName userName")
      .lean();

    const assignmentMap = {};
    assignments.forEach((a) => {
      assignmentMap[a.orderId.toString()] = {
        saleInfo: a.saleId,
        status: a.status,
      };
    });

    const productStockMap = {};
    const productCache = {};
    const oversellDetected = {};

    for (const order of orders) {
      const assignment = assignmentMap[order._id.toString()];

      order.assignedSale = assignment ? assignment.saleInfo : null;
      order.assignmentStatus = assignment ? assignment.status : "unassigned";

      order.stockWarning = false;

      if (
        !["pending", "confirmed", "shipping", "delivered"].includes(
          order.orderStatus
        )
      ) {
        continue;
      }

      for (const item of order.items) {
        const productId = item.productId.toString();
        const key = `${item.productType}_${productId}`;

        if (!productStockMap[key]) {
          if (!productCache[key]) {
            const Model = getModelByType(item.productType);
            productCache[key] = await Model.findById(productId).lean();
          }

          const product = productCache[key];
          productStockMap[key] = product?.stock || 0;
        }

        if (
          order.paymentMethod === "COD" &&
          order.orderStatus === "pending" &&
          productStockMap[key] < 0 &&
          !oversellDetected[key]
        ) {
          order.stockWarning = true;
          oversellDetected[key] = true;
        }

        productStockMap[key] -= item.quantity;
      }
    }

    res.json({
      orders,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
    });
  } catch (error) {
    res.status(500).json({ message: "Get all order fail" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const staffId = req.user._id;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const currentStatus = order.orderStatus;

    const allowedNextStatus = statusFlow[currentStatus];

    if (!allowedNextStatus || !allowedNextStatus.includes(status)) {
      return res.status(400).json({
        message: `Không thể chuyển từ ${currentStatus} sang ${status}`,
      });
    }

    // Restock nếu huỷ
    if (status === "cancelled") {
      for (const item of order.items) {
        const Model = getModelByType(item.productType);

        if (order.paymentMethod === "MOMOPAY") {
          await Model.findByIdAndUpdate(item.productId, {
            $inc: { reservedStock: -item.quantity },
          });
        } else {
          await Model.findByIdAndUpdate(item.productId, {
            $inc: { stock: item.quantity },
          });
        }
      }
    }

    order.orderStatus = status;

    if (order.paymentMethod === "COD") {
      if (status === "completed") {
        order.paymentStatus = "paid";
      }

      if (status === "returned") {
        order.paymentStatus = "refunded";
      }
    }

    order.statusLogs.push({
      status,
      note: "Staff updated order status",
      updatedBy: staffId,
    });

    await order.save();

    const assignment = await OrderAssignment.findOne({ orderId });

    if (assignment) {
      if (["confirmed", "shipping"].includes(status)) {
        assignment.status = "processing";
      }

      if (["completed", "cancelled", "returned"].includes(status)) {
        assignment.status = "completed";
      }

      await assignment.save();
    }

    res.json({
      message: "Update order status successful",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Update order status fail",
      error: error.message,
    });
  }
};

const cancelMyOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({
      _id: orderId,
      customerId: userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    if (order.orderStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể hủy đơn khi đang ở trạng thái chờ xử lý",
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Đơn đã thanh toán, không thể hủy trực tiếp",
      });
    }

    // Restock
    for (const item of order.items) {
      const Model = getModelByType(item.productType);

      if (order.paymentMethod === "MOMOPAY") {
        await Model.findByIdAndUpdate(item.productId, {
          $inc: { reservedStock: -item.quantity },
        });
      } else {
        await Model.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        });
      }
    }

    order.orderStatus = "cancelled";

    order.statusLogs.push({
      status: "cancelled",
      note: "Customer cancelled order",
      updatedBy: userId,
    });

    await order.save();

    return res.json({
      success: true,
      message: "Hủy đơn hàng thành công",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    return res.status(500).json({
      success: false,
      message: "Hủy đơn hàng thất bại",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getAllOrder,
  getMyOrders,
  updateOrderStatus,
  cancelMyOrder,
  getModelByType
};
