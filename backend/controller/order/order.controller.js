const Order = require("../../models/order/Order");
const Cart = require("../../models/order/Cart");
const Product = require("../../models/Products/Product");
const Discount = require("../../models/Discounts/Discount");

const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { shippingAddress, paymentMethod = "COD", discountCode } = req.body;

    // Validation dia chi
    if (
      !shippingAddress?.fullName ||
      !shippingAddress?.phone ||
      !shippingAddress?.province ||
      !shippingAddress?.ward ||
      !shippingAddress?.street
    ) {
      return res
        .status(400)
        .json({ message: "Thiếu thông tin địa chỉ giao hàng bắt buộc" });
    }

    if (!["COD", "MOMOPAY", "BANK"].includes(paymentMethod)) {
      return res
        .status(400)
        .json({ message: "Phương thức thanh toán không hợp lệ" });
    }

    const cart = await Cart.findOne({ userId }).lean();
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng trống" });
    }

    const orderItems = [];
    let subtotal = 0;

    // Kiểm tra sản phẩm & tồn kho
    for (const cartItem of cart.items) {
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

      const itemTotal = cartItem.quantity * cartItem.priceSnapshot;
      subtotal += itemTotal;

      orderItems.push({
        productId: cartItem.productId,
        nameSnapshot: cartItem.nameSnapshot,
        imageSnapshot: cartItem.imageSnapshot,
        priceSnapshot: cartItem.priceSnapshot,
        quantity: cartItem.quantity,
        // Nếu sau này có thêm variant thì bổ sung variantSnapshot: {...}
      });
    }

    // Xử lý mã giảm giá có thể mở rộng
    let discountAmount = 0;
    let appliedDiscountCode = null;

    if (discountCode) {
      const now = new Date();
     const discount = await Discount.findOne({ 
        code: discountCode.toUpperCase(), 
        status: 'active',
        validFrom: { $lte: now },
        expiredAt: { $gte: now },
        usageLimit: { $gt: 0 } // Pre-check usage >0
      });

      if (!discount) {
        return res.status(400).json({ 
          success: false, 
          message: 'Mã giảm giá không tồn tại, đã hết hạn hoặc bị vô hiệu hóa' 
        });
      }

      // 2. CHECK MIN ORDER VALUE
      if (subtotal < discount.minOrderValue) {
        return res.status(400).json({ 
          success: false, 
          message: `Đơn hàng tối thiểu phải từ ${discount.minOrderValue.toLocaleString()}đ để áp dụng mã ${discountCode}` 
        });
      }

      // 3. TÍNH DISCOUNT AMOUNT
      let calculatedDiscount = 0;
      if (discount.discountType === 'percent') {
        calculatedDiscount = subtotal * (discount.value / 100);
      } else if (discount.discountType === 'fixed') {
        calculatedDiscount = discount.value;
      }

      // Cap by maxDiscountValue
      discountAmount = Math.min(calculatedDiscount, discount.maxDiscountValue || calculatedDiscount);
      appliedDiscountCode = discount.code;

      // 4. ATOMIC GIẢM USAGE LIMIT (tránh race condition multi-user)
      const updateUsage = await Discount.findOneAndUpdate(
        { _id: discount._id, usageLimit: { $gt: 0 } }, // Double-check
        { $inc: { usageLimit: -1 } },
        { new: true }
      );

      if (!updateUsage) {
        return res.status(400).json({ 
          success: false, 
          message: 'Mã giảm giá đã hết lượt sử dụng trong lúc xử lý!' 
        });
      }
    
    }

    const finalAmount = Math.max(0, subtotal - discountAmount);

    const newOrder = new Order({
      customerId: userId,
      items: orderItems,
      subtotal,
      discountCode: appliedDiscountCode,
      discountAmount,
      finalAmount,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "unpaid" : "paid",
      orderStatus: "pending",
      // createdAt sẽ tự động có nếu schema có timestamps: true
    });

    await newOrder.save();

    // Giảm tồn kho (quan trọng!)
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }, // GIẢM stock
        { new: true, timestamps: false }
      );
    }

    // Xóa giỏ hàng
    await Cart.updateOne({ userId }, { $set: { items: [] } });

    return res.status(201).json({
      success: true,
      message: "Tạo đơn hàng thành công!",
      order: newOrder,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({
      success: false,
      message: "Tạo đơn hàng thất bại",
      error: error.message,
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ customerId: userId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return res.json({
      success: true,
      message: "Lấy danh sách đơn hàng thành công",
      orders, 
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
        const order = await Order.find().sort({createAt: -1}).lean();
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

module.exports = { createOrder, getOrderById, getAllOrder,getMyOrders,updateOrderStatus}