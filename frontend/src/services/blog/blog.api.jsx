import customizeAPI from '../customizeApi'; 
const blogService = {
  // 1. Lấy danh sách
  getAllBlogs: (params) => {
    return customizeAPI.get('/blogs', { params }); 
  },

  // 2. Lấy chi tiết
  getBlogDetail: (id) => {
    return customizeAPI.get(`/blogs/${id}`);
  },
  // 3. Tạo bài viết
  createBlog: (data) => {
    return customizeAPI.post('/blogs', data);
  },
  // 4. Sửa bài viết
  updateBlog: (id, data) => {
    return customizeAPI.put(`/blogs/${id}`, data);
  },
  // 5. Xóa bài viết
  deleteBlog: (id) => {
    return customizeAPI.delete(`/blogs/${id}`);
  }
};

export default blogService;