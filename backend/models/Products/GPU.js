const mongoose = require("mongoose");
const { Schema, Types } = mongoose;
const { baseProductFields } = require("./baseProduct");

const gpuSchema = new Schema(
  {
    ...baseProductFields,
    specifications: {
      // 🟢 CƠ BẢN
      vram: { type: String, required: true }, // 8GB, 12GB

      // 🟡 CẦN THIẾT
      core_clock: { type: Number },
      boost_clock: { type: Number },
      tdp: { type: Number }, // Tính nguồn

      // 🔵 MỞ RỘNG
      cuda_cores: { type: Number },
      memory_type: { type: String }, // GDDR6
      bus_width: { type: Number },
      length: { type: Number }, // mm (sau này check case)

      detail_json: { type: Schema.Types.Mixed, default: {} },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Gpu", gpuSchema);
