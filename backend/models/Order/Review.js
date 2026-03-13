const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const reviewSchema = new Schema(
  {
    productId: {
      type: Types.ObjectId,
      ref: "Product",
      required: true,
    },

    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderId: {
      type: Types.ObjectId,
      ref: "Order",
      required: true,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    comment: {
      type: String,
      trim: true,
      default: "",
      max: 1000,
    },

    images: [
      {
        type: String,
      },
    ],

    videos: [
      {
        type: String, 
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },

  },
  { timestamps: true }
);

reviewSchema.index({ productId: 1, orderId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
