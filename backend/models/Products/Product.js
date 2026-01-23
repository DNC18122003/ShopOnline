const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

// Schema cho lịch sử giá
const priceHistorySchema = new Schema(
  {
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    effectiveDate: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

// Schema chính cho Product
const productSchema = new Schema(
  {
    // Thông tin cơ bản
    name: {
      type: String,
      required: true,
      trim: true,
      index: "text",
    },

    description: {
      type: String,
      default: "",
      index: "text",
    },

    // Giá và lịch sử giá
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    price_history: [priceHistorySchema],

    // Hình ảnh (mảng URL)
    images: [
      {
        type: String,
      },
    ],

    // Tồn kho
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // Danh mục và thương hiệu
    category: {
      type: Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    brand: {
      type: Types.ObjectId,
      ref: "Brand",
      required: true,
      index: true,
    },

    // Thông số kỹ thuật
    specifications: {
      // Các thông số matching (dùng để kiểm tra tương thích)
      socket: {
        type: String,
        index: true,
      }, // CPU ↔ Mainboard

      ram_type: {
        type: String,
        index: true,
      }, // Mainboard ↔ RAM

      form_factor: {
        type: String,
      }, // Mainboard ↔ Case

      // Thông số hiển thị & lọc
      bus: {
        type: Schema.Types.Mixed,
      }, // Number hoặc String

      capacity: {
        type: Number,
      }, // Dung lượng (RAM, SSD...)

      vram: {
        type: String,
      }, // VRAM của VGA

      wattage: {
        type: Number,
      }, // Công suất PSU

      // Thông số chi tiết khác (JSON linh hoạt)
      detail_json: {
        type: Schema.Types.Mixed,
        default: {},
      },
    },

    // Trạng thái
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Người tạo
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, 
  },
);
