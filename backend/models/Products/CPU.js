const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const priceHistorySchema = new Schema(
  {
    price: { type: Number, required: true, min: 0 },
    effectiveDate: { type: Date, default: Date.now },
  },
  { _id: false },
);

const cpuSchema = new Schema(
  {
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
    specifications: {
      socket: { type: String, required: true, index: true },
      cores: { type: Number },
      threads: { type: Number },
      base_clock: { type: String },
      boost_clock: { type: String },
      tdp: { type: Number },
      detail_json: { type: Schema.Types.Mixed, default: {} },
    },
    isActive: { type: Boolean, default: true, index: true },
    labels: {
      type: [String],
      enum: ["new", "sale", "hot", "banner"],
      default: [],
      index: true
    },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CPU", cpuSchema);