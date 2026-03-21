const mongoose = require("mongoose");
const { Schema, Types } = mongoose;
const { baseProductFields } = require("./baseProduct");

const cpuSchema = new Schema(
  {
    ...baseProductFields,
    specifications: {
      // 🟢 CƠ BẢN (PHẢI CÓ để build PC)
      socket: { type: String, required: true, index: true }, // dùng để match mainboard

      // 🟡 CẦN THIẾT
      cores: { type: Number },
      threads: { type: Number },
      base_clock: { type: Number },
      boost_clock: { type: Number },
      tdp: { type: Number }, // dùng tính nguồn

      // 🔵 MỞ RỘNG
      cache: { type: String },
      integrated_gpu: { type: String },
      architecture: { type: String },

      detail_json: { type: Schema.Types.Mixed, default: {} },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cpu", cpuSchema);