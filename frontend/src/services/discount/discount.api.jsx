
import customizeAPI from '../customizeApi'; 
const discountService = {
  // 1. Lấy danh sách mã giảm giá
  getAllDiscounts: (params) => {
    return customizeAPI.get('/discounts', { params });
  },

  // 2. Lấy chi tiết mã giảm giá theo ID
  getDiscountById: (id) => {
    return customizeAPI.get(`/discounts/${id}`);
  },

  // 3. Tạo mã giảm giá mới 
  createDiscount: (data) => {
    return customizeAPI.post('/discounts', data);
  },

  // 4. Cập nhật mã giảm giá 
  updateDiscount: (id, data) => {
    return customizeAPI.put(`/discounts/${id}`, data);
  },

  // 5. Xóa mã giảm giá 
  deleteDiscount: (id) => {
    return customizeAPI.delete(`/discounts/${id}`);
  },

  // 6. Kiểm tra mã hợp lệ (dùng cho trang Checkout)
  checkDiscountValidity: (data) => {
    return customizeAPI.post('/discounts/check', data);
  }
};

export default discountService;