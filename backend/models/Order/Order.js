const mongoose = require("mongoose");
const { Schema, Types } = mongoose;
const addressSchema = new Schema(
  {
    fullName: String,
    phone: String,
    street: String,
    ward: String,
    province: String,
    note: String,
  },
  { _id: false }
);

const orderItemSchema = new Schema(
  {
    productId: {
      type: Types.ObjectId,
      ref: "Product",
      required: true,
    },

    nameSnapshot: {
      type: String,
      required: true,
    },

    imageSnapshot: {
      type: String,
    },

    priceSnapshot: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    orderCode: {
      type: String,
      unique: true,
      index: true,
      default: () => require("crypto").randomUUID(),
    },

    customerId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
    },

    subtotal: {
      type: Number,
      required: true,
    },

    discountCode: {
      type: String,
    },

    discountAmount: {
      type: Number,
      default: 0,
    },

    finalAmount: {
      type: Number,
      required: true,
    },

    shippingAddress: {
      type: addressSchema,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "MOMOPAY"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
      index: true,
    },

    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

orderSchema.index({ customerId: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
