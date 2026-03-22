// models/Products/Ram.js
const mongoose = require("mongoose");
const { Schema, Types } = mongoose;
const { baseProductFields } = require("./baseProduct");

const ramSchema = new Schema(
  {
    ...baseProductFields,
    specifications: {
      // 🟢 CƠ BẢN
      ram_type: { type: String, required: true, index: true }, // DDR4, DDR5 (match mainboard)
      capacity: { type: Number, required: true }, // GB

      // 🟡 CẦN THIẾT
      bus: { type: Number }, // MHz
      sticks: { type: Number }, // số thanh RAM

      // 🔵 MỞ RỘNG
      latency: { type: String }, // CL16, CL18
      voltage: { type: Number },
      rgb: { type: Boolean, default: false },

      detail_json: { type: Schema.Types.Mixed, default: {} },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ram", ramSchema);
