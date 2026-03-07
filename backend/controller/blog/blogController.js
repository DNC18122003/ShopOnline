const Blog = require('../../models/Blogs/Blog'); 

const generateSlug = (title) => {
  return title
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Bỏ dấu tiếng Việt
    .replace(/[^\w\s-]/g, '') // Bỏ ký tự đặc biệt
    .replace(/\s+/g, '-'); // Thay khoảng trắng bằng dấu gạch ngang
};

const blogController = {
  // 1. danh sách bài viết
 getAllBlogs: async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    if (status) query.status = status;
    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 }); 

    res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
},
  // 2. Tạo bài viết mới
  createBlog: async (req, res) => {
  try {
    let { title, slug, content, author, thumbnail, status } = req.body;
    // 1. Kiểm tra các trường không được rỗng
    if(!title){
      return res.status(400).json({
        success: false,
        message: 'Trường tiêu đề không được để trống'
      });
    }
    if(!author){
      return res.status(400).json({
        success: false,
        message: 'Tác giả không được để trống'
      });
    }
    if(!content){
      return res.status(400).json({
        success: false,
        message: 'Nội dung không được để trống'
      });
    }
    if(!thumbnail){
      return res.status(400).json({
        success: false,
        message: 'Ảnh bìa không được để trống'
      });
    }
    // 2. Kiểm tra độ dài tiêu đề 
    if (title.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Tiêu đề không được quá 50 ký tự' 
      });
    }
    // 3. Kiểm tra độ dài nội dung
    if (content.length > 500) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nội dung không được quá 500 ký tự' 
      });
    }

    // 3. Validate Ảnh 
    const allowedExtensions = ['image/png', 'image/jpeg', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; 

    if (thumbnail.size > maxSize) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ảnh vượt quá kích thước cho phép (tối đa 5MB)' 
      });
    }
    // 4. Xử lý Slug
    if (!slug && title) {
      slug = generateSlug(title);
    }

    // 5. Kiểm tra slug tồn tại
    const existingBlog = await Blog.findOne({ slug });
    if (existingBlog) {
      return res.status(400).json({ 
        success: false, 
        message: 'Slug hoặc tiêu đề bài viết đã tồn tại' 
      });
    }

    // 6. Tạo Blog mới
    const newBlog = await Blog.create({
      title,
      slug,
      content,
      author,
      thumbnail: thumbnail.path || thumbnail, 
      status
    });

    res.status(201).json({
      success: true,
      message: 'Tạo bài viết thành công',
      data: newBlog
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
},
  // 3. Lấy chi tiết bài viết (Theo ID)
  getBlogById: async (req, res) => {
    try {
      const { id } = req.params;

      // Chỉ lấy thông tin bài viết, loại bỏ hàm update viewCount
      const blog = await Blog.findById(id); 

      if (!blog) {
        return res.status(404).json({ 
          success: false, 
          message: 'Bài viết không tồn tại' 
        });
      }
      res.status(200).json({ 
        success: true, 
        data: blog 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  },
  
  // 4. Lấy chi tiết bài viết (Theo Slug - Dùng cho trang chi tiết phía Client)
  getBlogBySlug: async (req, res) => {
    try {
        const { slug } = req.params;

        const blog = await Blog.findOneAndUpdate(
            { slug: slug },
            { $inc: { viewCount: 1 } },
            { new: true }
        ).populate('author', 'name email');

        if (!blog) {
            return res.status(404).json({ 
              success: false, 
              message: 'Bài viết không tồn tại' 
            });
        }

        res.status(200).json({ 
          success: true, 
          data: blog 
        });
    } catch (error) {
        res.status(500).json({ 
          success: false, 
          message: error.message 
        });
    }
  },

// 5. Cập nhật bài viết
  updateBlog: async (req, res) => {
    try {
      // 1. Lấy ID từ tham số URL
      const { id } = req.params; 
      
      // 2. Lấy dữ liệu từ Request Body
      let { title, slug, content,  thumbnail} = req.body; 

      // 3. Thực hiện kiểm tra lỗi (Validate) TRƯỚC KHI lưu
      if (!title) {
        return res.status(400).json({ success: false, message: 'Trường tiêu đề không được để trống' });
      }
      if (!content) {
        return res.status(400).json({ success: false, message: 'Nội dung không được để trống' });
      }
      if (!thumbnail) {
        return res.status(400).json({ success: false, message: 'Ảnh bìa không được để trống' });
      }
      if (title.length > 50) {
        return res.status(400).json({ success: false, message: 'Tiêu đề không được quá 50 ký tự' });
      }
      if (content.length > 500) {
        return res.status(400).json({ success: false, message: 'Nội dung không được quá 500 ký tự' });
      }

      // Xử lý Slug
      if (!slug && title) {
        slug = generateSlug(title);
      }

      // Kiểm tra trùng slug 
      const existingBlog = await Blog.findOne({ slug, _id: { $ne: id } });
      if (existingBlog) {
        return res.status(400).json({ success: false, message: 'Slug hoặc tiêu đề bài viết đã tồn tại' });
      }

      // 4. SAU KHI DỮ LIỆU ĐÃ CHUẨN -> Tiến hành Update vào Database
      const updatedBlog = await Blog.findByIdAndUpdate(
        id, 
        req.body, // Hoặc truyền { title, slug, content, author, thumbnail, status }
        { new: true, runValidators: true }
      );

      if (!updatedBlog) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết để sửa' });
      }

      res.status(200).json({
        success: true,
        message: 'Cập nhật bài viết thành công',
        data: updatedBlog
      });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  // 6. Xóa bài viết
  deleteBlog: async (req, res) => {
    try {
      const { id } = req.params;
      const deletedBlog = await Blog.findByIdAndDelete(id);

      if (!deletedBlog) {
        return res.status(404).json({ 
          success: false, 
          message: 'Không tìm thấy bài viết để xóa' 
        });
      }

      res.status(200).json({
        success: true,
        message: 'Đã xóa bài viết thành công'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }
};

module.exports = blogController;