// Model Mainboard
const mongoose = require("mongoose");
const { Schema, Types } = mongoose;
const { baseProductFields } = require("./baseProduct");

const mainboardSchema = new Schema(
  {
    ...baseProductFields,
    specifications: {
      // 🟢 CƠ BẢN
      socket: { type: String, required: true, index: true }, // match CPU
      ram_type: { type: String, required: true, index: true }, // match RAM

      // 🟡 CẦN THIẾT
      max_ram_capacity: { type: Number },
      ram_slots: { type: Number },
      form_factor: { type: String }, // ATX, mATX (match case)

      // 🔵 MỞ RỘNG
      chipset: { type: String },
      pcie_version: { type: String },
      m2_slots: { type: Number },
      sata_ports: { type: Number },

      detail_json: { type: Schema.Types.Mixed, default: {} },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Mainboard", mainboardSchema);
