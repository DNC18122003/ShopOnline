const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const discountSchema = new Schema({
  code: { 
    type: String, 
    unique: true, 
    required: [true, 'Mã giảm giá là bắt buộc'], 
    uppercase: true, 
    trim: true 
  },
  description: { 
    type: String, 
    required: [true, 'Mô tả không được để trống'] 
  },
  discountType: { 
    type: String, 
    enum: ['percent', 'fixed'], 
    required: true 
  },
  value: { 
    type: Number, 
    required: true 
  },
  minOrderValue: { 
    type: Number, 
    default: 0 
  },
  maxDiscountValue: { 
    type: Number 
  },	
  usageLimit: { 
    type: Number, 
    default: 1 
  },
  validFrom: { 
    type: Date, 
    required: true 
  },
  expiredAt: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'active' 
  },
}, { 
  timestamps: true 
});

const Discount = mongoose.model('Discount', discountSchema);
module.exports = Discount;