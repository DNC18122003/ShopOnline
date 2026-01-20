import mongoose, { model } from "mongoose";
const { Schema, Types } = mongoose;

/**
 * model pruduct tạm thời để demo cart
 */
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
  { _id: false }
);

/**
 * Product Schema – PC Parts
 */
const productSchema = new Schema(
  {
    /* ===== BASIC INFO ===== */
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

    type: {
      type: String,
      required: true,
      enum: [
        "CPU",
        "MAINBOARD",
        "RAM",
        "GPU",
        "PSU",
        "CASE",
        "STORAGE",
        "COOLER",
        "OTHER",
      ],
      index: true,
    },

    /* ===== PRICE ===== */
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    price_history: {
      type: [priceHistorySchema],
      default: [],
    },

    /* ===== MEDIA ===== */
    images: {
      type: [String], // URL images
      default: [],
    },

    /* ===== INVENTORY ===== */
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    /* ===== RELATION ===== */
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

    /* ===== SPECIFICATIONS ===== */
    specifications: {
      // === Compatibility (dùng để build PC) ===
      socket: { type: String, index: true }, // CPU ↔ Mainboard
      ram_type: { type: String, index: true }, // DDR4 / DDR5
      form_factor: { type: String }, // ATX / mATX / ITX

      // === Filterable specs ===
      bus: { type: Number }, // RAM bus / PCIe
      capacity: { type: Number }, // GB
      vram: { type: Number }, // GPU VRAM (GB)
      wattage: { type: Number }, // PSU

      // === Extra details (hiển thị) ===
      detail_json: {
        type: Schema.Types.Mixed,
        default: {},
      },
    },

    /* ===== AUDIT ===== */
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ================= INDEX ================= */
productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1, brand: 1, type: 1, isActive: 1 });
productSchema.index({ "specifications.socket": 1 });
productSchema.index({ "specifications.ram_type": 1 });

/* ================= MIDDLEWARE ================= */
/**
 * Tự động lưu price_history khi giá thay đổi
 */
productSchema.pre("save", function (next) {
  if (this.isModified("price")) {
    this.price_history.push({
      price: this.price,
      effectiveDate: new Date(),
    });
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);
