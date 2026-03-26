const mongoose = require("mongoose");
const { Schema, Types } = mongoose;
const addressSchema = new Schema(
  {
    fullName: String,
    phone: String,
    email: String,
    street: String,
    ward: String,
    province: String,
    note: String,
  },
  { _id: false },
);
const statusLogSchema = new Schema(
  {
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "shipping",
        "delivered",
        "completed",
        "cancelled",
        "delivery_failed",
        "returned",
      ],
      required: true,
    },

    note: {
      type: String,
      default: "",
    },
    /*
    Đan câp nhật : ref => user => emplyee
    
    */
    updatedBy: {
      type: Types.ObjectId,
      ref: "Employee",
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const orderItemSchema = new Schema(
  {
    productId: {
      type: Types.ObjectId,
      required: true,
    },
    productType: {
      type: String,
      enum: ["Cpu", "Gpu", "Ram", "Mainboard", "Product"],
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
      enum: [
        "pending",
        "confirmed",
        "shipping",
        "delivered",
        "completed",
        "cancelled",
        "delivery_failed",
        "returned",
      ],
      default: "pending",
      index: true,
    },
    statusLogs: {
      type: [statusLogSchema],
      default: [],
    },
    momoTransId: {
      type: String,
    },
    reservationExpiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

orderSchema.index({ customerId: 1, createdAt: -1 });

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
