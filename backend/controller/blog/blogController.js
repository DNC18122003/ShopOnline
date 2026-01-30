// LƯU Ý QUAN TRỌNG: Kiểm tra kỹ đường dẫn file Model
// Dựa vào ảnh cũ của bạn thì thư mục tên là 'Blogs' (số nhiều)
const Blog = require('../../models/Blogs/Blog'); 

// Hàm hỗ trợ tạo slug đơn giản (nếu chưa cài thư viện slugify)
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Bỏ dấu tiếng Việt
    .replace(/[^\w\s-]/g, '') // Bỏ ký tự đặc biệt
    .replace(/\s+/g, '-'); // Thay khoảng trắng bằng dấu gạch ngang
};

const blogController = {

  // 1. Tạo bài viết mới
  createBlog: async (req, res) => {
    try {
      let { title, slug, content, authorId, thumbnail, status } = req.body;

      // Nếu không truyền slug, tự tạo từ title
      if (!slug && title) {
        slug = generateSlug(title);
      }

      // Kiểm tra xem slug đã tồn tại chưa
      const existingBlog = await Blog.findOne({ slug });
      if (existingBlog) {
        return res.status(400).json({ success: false, message: 'Slug hoặc tiêu đề bài viết đã tồn tại' });
      }

      const newBlog = await Blog.create({
        title,
        slug,
        content,
        authorId, // Lưu ý: Nếu có middleware auth, thường lấy từ req.user._id
        thumbnail,
        status
      });

      res.status(201).json({
        success: true,
        message: 'Tạo bài viết thành công',
        data: newBlog
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 2. Lấy danh sách bài viết (Có lọc theo status và populate author)
  getAllBlogs: async (req, res) => {
    try {
      const { status } = req.query;
      let query = {};

      // Nếu có truyền status (ví dụ ?status=published) thì lọc
      if (status) query.status = status;

      const blogs = await Blog.find(query)
        .populate('authorId', 'name email') // Lấy tên và email tác giả từ bảng User
        .sort({ createdAt: -1 }); // Mới nhất lên đầu

      res.status(200).json({
        success: true,
        count: blogs.length,
        data: blogs
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 3. Lấy chi tiết bài viết (Theo ID) + Tăng View
  getBlogById: async (req, res) => {
    try {
      const { id } = req.params;

      // Tìm và cập nhật viewCount + 1 (Sử dụng $inc)
      const blog = await Blog.findByIdAndUpdate(
        id, 
        { $inc: { viewCount: 1 } }, // Tăng view lên 1
        { new: true } // Trả về data mới sau khi tăng
      ).populate('authorId', 'name email');

      if (!blog) {
        return res.status(404).json({ success: false, message: 'Bài viết không tồn tại' });
      }

      res.status(200).json({ success: true, data: blog });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
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
        ).populate('authorId', 'name email');

        if (!blog) {
            return res.status(404).json({ success: false, message: 'Bài viết không tồn tại' });
        }

        res.status(200).json({ success: true, data: blog });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
  },

  // 5. Cập nhật bài viết
  updateBlog: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Nếu user đổi title mà không gửi slug mới, có thể cần generate lại slug (tùy logic của bạn)
      // Ở đây mình giữ nguyên logic update cơ bản
      const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, { 
        new: true,
        runValidators: true 
      });

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
        return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết để xóa' });
      }

      res.status(200).json({
        success: true,
        message: 'Đã xóa bài viết thành công'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = blogController;