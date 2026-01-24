const Order = require("../../models/order/Order");
const Cart = require("../../models/order/Cart");
const Product = require("../../models/product/Product");

const createOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const { shippingAddress, paymentMethod, discountCode } = null;
        
        const cart = await Cart.findOne({userId});
        if(!cart || cart.items.length === 0){
            return res.status(400).json({ message:"Empty cart"});
        }

        const orderItems = [];
        let subtotal = 0;

        for (const cartItem of cart.items){
            const product = await Product.findById(cartItem.productId);
            if(!product || !product.isActive){
                return res.status(400).json({message : `Product: ${cartItem.nameSnapshot} unavailable or has been baned`});
            }
            if(product.stock < cartItem.quantity){
                return res.status(400).json({message:`Product: ${cartItem.nameSnapshot} only ${product.stock} left !`});
            }
            orderItems.push({
              productId: cartItem.productId,
              nameSnapshot: cartItem.nameSnapshot,
              imageSnapshot: cartItem.imageSnapshot,
              priceSnapshot: cartItem.priceSnapshot,
              quantity: cartItem.quantity,
            });

            subtotal += cartItem.quantity + cartItem.priceSnapshot;
        }
        // Handle discount 
        const discountAmount = 0 
        const finalAmount = subtotal - discountAmount;
        
        const newOrder = new Order({
            customerId: userId,
            items: orderItems,
            subtotal,
            discountCode: discountCode || undefined,
            finalAmount,
            shippingAddress,
            paymentMethod,
            paymentStatus: paymentMethod ==="COD" ? "unpaid": "pending",
            orderStatus: "pending"
        })
        await newOrder.save();

        for (const item of orderItems){
            await Product.findByIdAndUpdate(item.productId,{
                $inc: {stock: item.quantity},
            });
            
        }
        // Remove item form cart
        cart.items = [];
        await cart.save();

        return res.status(201).json({
            message:"Create Order successful !",
            order: newOrder
        });

    } catch (error) {
      res.status(500).json({ message: "Create order failed !", error: err.message });
    }
            
}

const getMyOrders = async (req, res) => {
    try {
        const userId = req.user._id;
        const order = await Order.findById({customerId : userId}).sort({createAt: -1}).lean();
        res.json({message:'Get order success', order});

    } catch (error) {
        res.status(500).json({message: 'Get order fail'})
    }
}

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