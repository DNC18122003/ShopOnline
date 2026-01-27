const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const reviewSchema = new Schema(
  {
    productId: {
      type: Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    userId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true, 
  }
);



module.exports = mongoose.model('Review', reviewSchema);