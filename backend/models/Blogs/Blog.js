const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blogSchema = new Schema({
  title: { 
    type: String, 
    required: [true, 'Tiêu đề bài viết không được để trống'],
    trim: true 
  },
  slug: { 
    type: String, 
    unique: true,
    lowercase: true,
    trim: true 
  },
  content: { 
    type: String, 
    required: [true, 'Nội dung bài viết không được để trống'] 
  },
  thumbnail: { 
    type: String,
    default: 'default-blog.jpg' 
  },
  authorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Bài viết phải có tác giả']
  },
  status: { 
    type: String, 
    enum: {
        values: ['draft', 'published'],
        message: '{VALUE} không hợp lệ (chỉ được draft hoặc published)'
    }, 
    default: 'draft' 
  },
  viewCount: { 
    type: Number, 
    default: 0 
  },
}, { 
  timestamps: true 
});

const Blog = mongoose.model('Blog', blogSchema);
module.exports = Blog;