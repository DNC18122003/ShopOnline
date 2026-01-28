const Cart = require("../../models/order/Cart");
const Product = require("../../models/Products/Product");
const getCart = async (req, res) => {
    try {
       if (!req.user?._id) {
         return res.status(401).json({ message: "Unauthorized" });
       }
        const userId = req.user?._id;
        const cart = await Cart.findOne({userId}).lean();
        
        if(!cart){
            return res.json({
                items: [],
                totalQuantity : 0,
                totalPrice: 0,
            });
        }
        const totalQuantity = cart.items.reduce(
            (sum, item) => sum + item.quantity, 0
        );

        const totalPrice = cart.items.reduce(
            (sum, item) => sum + item.quantity * item.priceSnapshot, 0
        );

        res.json({
          ...cart,
          totalQuantity,
          totalPrice
        });


    }catch (error){
        res.status(500).json({
          success: false,
          message: "Get cart failed",
          error: error.message,
        });
    }
};

const addToCart = async (req, res) => {
    try {
        console.log("REQ.USER:", req.user); // 👈 BẮT BUỘC
        console.log("REQ.BODY:", req.body);
        const userId = req.user?._id;
        const {productId, quantity = 1} = req.body;
        
        if(quantity <= 0){
           return res.status(400).json({ message: "Invalid quantity" });
        }
        if (quantity > 99) {
           return res.status(400).json({
             message: "The quantity must not exceed 99 products.",
           });
        }
         const product = await Product.findById(productId).lean();
         if (!product || !product.isActive) {
           return res.status(404).json({ message: "Product not found" });
         }

         if (product.stock < quantity) {
           return res.status(400).json({ message: "Not enough stock" });
         }

         let cart = await Cart.findOne({ userId });
         if (!cart) cart = new Cart({ userId, items: [] });

         const index = cart.items.findIndex(
           (i) => i.productId.toString() === productId
         );

         if (index > -1) {
           const newQuantity = cart.items[index].quantity + quantity;
           if (newQuantity > product.stock) {
             return res.status(400).json({ message: "Exceed stock limit" });
           }
           cart.items[index].quantity = newQuantity;
         } else {
           cart.items.push({
             productId,
             quantity,
             priceSnapshot: product.price,
             nameSnapshot: product.name,
             imageSnapshot: product.images?.[0] || "",
           });
         }
         
         await cart.save();
         console.log("CART SAVED:", cart._id);

        res.json(cart.toObject());

    } catch (error) {
        res.status(500).json({ message: "Add to cart failed", error: error.message });
  }

};

const updateCart = async (req, res) => {
    try {
          const userId = req.user._id;
          const { productId, quantity } = req.body;

          if (quantity < 0)
            return res.status(400).json({ message: "Invalid quantity" });

          const cart = await Cart.findOne({ userId });
          if (!cart) return res.status(404).json({ message: "Cart not found" });

          const itemIndex = cart.items.findIndex(
            (i) => i.productId.toString() === productId
          );

          if (itemIndex === -1)
            return res.status(404).json({ message: "Item not found in cart" });

          if (quantity === 0) {
            cart.items.splice(itemIndex, 1);
            await cart.save();
            return res.json(cart.toObject());
          }

          const product = await Product.findById(productId).lean();
          if (!product || product.stock < quantity) {
            return res.status(400).json({ message: "Not enough stock" });
          }

          cart.items[itemIndex].quantity = quantity;
          await cart.save();

         res.json(cart.toObject());
        
    } catch (error) {
        res.status(500).json({ message: "Update to cart failed", error: error.message });
    }
};

const deleteCart = async (req, res) => {
    try {
         const userId = req.user._id;
         const { productId } = req.params;

         const cart = await Cart.findOneAndUpdate(
           { userId },
           { $pull: { items: { productId } } },
           { new: true }
         );

       res.json(cart ? cart.toObject() : { items: [] });
    } catch (error) {
       res.status(500).json({ message: "Delete to cart failed", error: error.message });          
    }
};

const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const updatedCart = await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [] } },
      { new: true } 
    );

    if (!updatedCart) {
      return res.json({
        items: [],
        totalQuantity: 0,
        totalPrice: 0,
      });
    }

    
    res.json(updatedCart.toObject());
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({
      success: false,
      message: "Clear cart failed",
      error: error.message,
    });
  }
};




module.exports = {getCart , addToCart, updateCart,deleteCart, clearCart};