const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

// Data DEMO Product 
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


const productSchema = new Schema(
  {
    /* ===== BASIC INFO ===== */
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
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
    },

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
      type: [String],
      default: [],
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    /* ===== RELATION ===== */
    category: {
      type: Types.ObjectId,
      ref: "Category",
      required: true,
    },

    brand: {
      type: Types.ObjectId,
      ref: "Brand",
      required: true,
    },

    /* ===== SPECIFICATIONS ===== */
    specifications: {
      // dùng cho build PC
      socket: { type: String }, // CPU ↔ Mainboard
      ram_type: { type: String }, // DDR4 / DDR5
      form_factor: { type: String }, // ATX / mATX / ITX

      // filter
      bus: { type: Number },
      capacity: { type: Number },
      vram: { type: Number },
      wattage: { type: Number },

      // chi tiết hiển thị
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


// Full-text search
productSchema.index({ name: "text", description: "text" });

// Filter cơ bản
productSchema.index({ category: 1, brand: 1, type: 1, isActive: 1 });

// Build PC / compatibility
productSchema.index({ "specifications.socket": 1 });
productSchema.index({ "specifications.ram_type": 1 });


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
