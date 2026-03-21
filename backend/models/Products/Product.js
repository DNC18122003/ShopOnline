const mongoose = require("mongoose");
const { Schema, Types } = mongoose;
const { baseProductFields } = require("./baseProduct");

// Schema chính cho Product
const productSchema = new Schema(
  {
    ...baseProductFields,
    // Thông số kỹ thuật
    specifications: {
      // Nơi chứa các thông số tự do dạng JSON cho phụ kiện, gear...
      detail_json: {
        type: Schema.Types.Mixed,
        default: {},
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
