const mongoose = require("mongoose");

const orderAssignmentSchema = new mongoose.Schema(
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
      enum: ["waiting", "accepted", "timeout", "rejected"], // Thêm timeout/rejected để làm báo cáo
      default: "waiting",
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },

    acceptedAt: Date,
    // Lưu lại danh sách các sale đã từng hụt đơn này (để không gán lại cho họ nữa)
    historySales: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    reassignCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);
orderAssignmentSchema.index({ saleId: 1, status: 1 });
orderAssignmentSchema.index({ assignedAt: 1 });
module.exports = mongoose.model("OrderAssignment", orderAssignmentSchema);