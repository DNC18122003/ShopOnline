const mongoose = require("mongoose");

const OrderAssignmentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },

    saleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["waiting", "accepted", "timeout", "rejected"],
      default: "waiting",
    },

    assignedAt: {
      type: Date,
      default: Date.now,
    },

    historySales: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    reassignCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OrderAssignment", OrderAssignmentSchema);
