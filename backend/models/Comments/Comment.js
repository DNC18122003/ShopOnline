const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const commentSchema = new Schema({
  productId: { 
    type: Types.ObjectId, 
    ref: 'Product', 
    required: true, 
    index: true 
  },
  userId: { 
    type: Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  content: { 
    type: String, 
    required: true, 
    trim: true 
  },
  parentId: { 
    type: Types.ObjectId, 
    ref: 'Comment', 
    default: null, 
    index: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });


module.exports = mongoose.model('Comment', commentSchema);