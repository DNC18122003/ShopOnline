const Order = require("../../models/order/Order");
const Cart = require("../../models/order/Cart");
const Product = require("../../models/Products/Product");
const Discount = require("../../models/Discounts/Discount");
const { createMomoPayment } = require("./momo.controller");
const mongoose = require("mongoose");
const User = require("../../models/User");

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

    if (!["COD", "MOMOPAY", "BANK"].includes(paymentMethod)) {
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
      const product = await Product.findById(cartItem.productId).lean();

      if (!product || !product.isActive) {
        return res.status(400).json({
          message: `Sản phẩm "${cartItem.nameSnapshot}" không khả dụng hoặc đã bị khóa`,
        });
      }

      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          message: `Sản phẩm "${cartItem.nameSnapshot}" chỉ còn ${product.stock} sản phẩm`,
        });
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

      orderItems.push({
        productId: cartItem.productId,
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
        { $inc: { usageLimit: -1 } },
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
    });

    await newOrder.save();

    // =========================
    // 6. MOMO PAYMENT
    // =========================
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
      const updated = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (!updated) {
        await Order.findByIdAndUpdate(newOrder._id, {
          orderStatus: "cancelled",
          note: "Hết hàng lúc xác nhận",
        });

        return res.status(400).json({
          message: `Hết hàng sản phẩm ${item.nameSnapshot}`,
        });
      }
    }

    //  XÓA CART (NẾU CHECKOUT CART)
    if (selectedProductIds?.length) {
      await Cart.updateOne(
        { userId },
        {
          $pull: {
            items: {
              productId: {
                $in: selectedProductIds.map(
                  (id) => new mongoose.Types.ObjectId(id)
                ),
              },
            },
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

    const total = await Order.countDocuments(query);

    return res.json({
      success: true,
      orders,
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
        const {orderId} = req.params;
        const userId = req.user._id;

        const order = await Order.findOne({_id : orderId, customerId: userId}).lean();
        if(!order){
            return res.status(404).json({message:'Order not found !'});
        }
        res.json(order);
        
    } catch (error) {
        res.status(500).json({message:"Get Order by Id fail"})
    }
}

const getAllOrder = async (req, res) => {
    try {
        const order = await Order.find().sort({createdAt: -1}).lean();
        res.json(order);
    } catch (error) {
        res.status(500).json({message:'Get all order fail'});
    }
}

const updateOrderStatus = async (req, res) => {
    const {orderId} = req.params;
    const {status} = req.body;

    const order = await Order.findByIdAndUpdate(
        orderId,
        {orderStatus: status},
        {new: true, runValidators: true}
    );
    if (!order){
        return res.status(404).json({message: 'Order not found !'});
       
    }
     res.json({message:'Update order status successful', order});
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

    // Chỉ cho hủy khi pending
    if (order.orderStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể hủy đơn khi đang ở trạng thái chờ xử lý",
      });
    }

    //  Không cho hủy nếu đã thanh toán
    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Đơn đã thanh toán, không thể hủy trực tiếp",
      });
    }

    //  Hoàn lại stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }

    order.orderStatus = "cancelled";
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

module.exports = { createOrder, getOrderById, getAllOrder,getMyOrders,updateOrderStatus,cancelMyOrder}