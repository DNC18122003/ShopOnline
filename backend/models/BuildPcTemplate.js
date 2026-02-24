const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const buildPcTemplateSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    // Mục đích sử dụng: gaming, office, design...
    usageType: {
      type: String,
      default: "",
      trim: true,
    },
    // Người tạo / cập nhật
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    updatedBy: {
      type: Types.ObjectId,
      ref: "User",
    },
    // Các linh kiện (lưu Product ID)
    components: {
      cpu: { type: Types.ObjectId, ref: "Product" },
      main: { type: Types.ObjectId, ref: "Product" },
      ram: { type: Types.ObjectId, ref: "Product" },
      gpu: { type: Types.ObjectId, ref: "Product" },
      ssd: { type: Types.ObjectId, ref: "Product" },
      hdd: { type: Types.ObjectId, ref: "Product" },
      psu: { type: Types.ObjectId, ref: "Product" },
      case: { type: Types.ObjectId, ref: "Product" },
    },
    // Tổng giá tham khảo (có thể tính lại phía client)
    totalPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

buildPcTemplateSchema.index({ name: "text", description: "text" });
buildPcTemplateSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model("BuildPcTemplate", buildPcTemplateSchema);

