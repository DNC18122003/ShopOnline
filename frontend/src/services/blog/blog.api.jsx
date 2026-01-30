// services/blogService.js
import customizeAPI from './customizeAPi'; 
const blogService = {
  // 1. Lấy danh sách
  getAllBlogs: (queryString) => {
    return customizeAPI.get(`/blog${queryString ? `?${queryString}` : ''}`); 
  },

  // 2. Lấy chi tiết
  getBlogDetail: (id) => {
    return customizeAPI.get(`/blog/${id}`);
  },
  // 3. Tạo bài viết
  createBlog: (data) => {
    return customizeAPI.post('/blog', data);
  },
  // 4. Sửa bài viết
  updateBlog: (id, data) => {
    return customizeAPI.put(`/blog/${id}`, data);
  },
  // 5. Xóa bài viết
  deleteBlog: (id) => {
    return customizeAPI.delete(`/blog/${id}`);
  }
};

export default blogService;