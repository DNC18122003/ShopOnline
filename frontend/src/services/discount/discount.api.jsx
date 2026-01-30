
import customizeAPI from '../customizeApi'; 
const discountService = {
  // 1. Lấy danh sách mã giảm giá
  getAllDiscounts: (params) => {
    return customizeAPI.get('/discount', { params });
  },

  // 2. Lấy chi tiết mã giảm giá theo ID
  getDiscountById: (id) => {
    return customizeAPI.get(`/discount/${id}`);
  },

  // 3. Tạo mã giảm giá mới 
  createDiscount: (data) => {
    return customizeAPI.post('/discount', data);
  },

  // 4. Cập nhật mã giảm giá 
  updateDiscount: (id, data) => {
    return customizeAPI.put(`/discount/${id}`, data);
  },

  // 5. Xóa mã giảm giá 
  deleteDiscount: (id) => {
    return customizeAPI.delete(`/discount/${id}`);
  },

  // 6. Kiểm tra mã hợp lệ (dùng cho trang Checkout)
  checkDiscountValidity: (data) => {
    return customizeAPI.post('/discount/check', data);
  }
};

export default discountService;