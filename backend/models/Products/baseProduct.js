const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

// Schema cho lịch sử giá
const priceHistorySchema = new Schema(
  {
    price: { type: Number, required: true, min: 0 },
    effectiveDate: { type: Date, default: Date.now },
  },
  { _id: false }
);

// Các trường cơ bản áp dụng cho MỌI sản phẩm
const baseProductFields = {
  name: { type: String, required: true, trim: true, index: "text" },
  description: { type: String, default: "", index: "text" },
  price: { type: Number, required: true, min: 0 },
  price_history: [priceHistorySchema],
  averageRating: { type: Number, default: 0, min: 0, max: 5, index: true },
  reviewCount: { type: Number, default: 0, min: 0 },
  images: [{ type: String }],
  stock: { type: Number, required: true, min: 0, default: 0 },
  reservedStock: { type: Number, default: 0, min: 0 },
  category: { type: Types.ObjectId, ref: "Category", required: true, index: true },
  brand: { type: Types.ObjectId, ref: "Brand", required: true, index: true },
  isActive: { type: Boolean, default: true, index: true },
  labels: {
    type: [String],
    enum: ["new", "sale", "hot", "banner"],
    default: [],
    index: true,
  },
  createdBy: { type: Types.ObjectId, ref: "Employee", required: true },
};

module.exports = { baseProductFields, priceHistorySchema };