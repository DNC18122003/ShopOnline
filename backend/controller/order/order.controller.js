const Order = require("../../models/order/Order");
const Cart = require("../../models/order/Cart");
const Product = require("../../models/Products/Product");

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

      // const discount = await Discount.findOne({ code: discountCode, isActive: true });
      // if (discount && new Date() >= discount.startDate && new Date() <= discount.endDate) {
      //     discountAmount = discount.type === 'PERCENT'
      //         ? subtotal * (discount.value / 100)
      //         : discount.value;
      //     appliedDiscountCode = discountCode;
      // } else {
      //     return res.status(400).json({ message: "Mã giảm giá không hợp lệ hoặc đã hết hạn" });
      // }

      // Hiện tại để tạm (demo)
      discountAmount = 0;
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
      paymentStatus: paymentMethod === "COD" ? "unpaid" : "pending",
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