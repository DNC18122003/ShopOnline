const Discount = require('../../models/Discounts/Discount');

const discountController = {
  // 1. Lấy danh sách mã giảm giá (có phân trang + filter status + date)
  getAllDiscounts: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Lấy các tham số filter từ query (thêm discountType)
      const { status, code, startDate, endDate, discountType } = req.query;
      
      let query = {};

      // 1. Lọc theo trạng thái
      if (status && status !== 'all') {
        query.status = status;
      }

      // 2. Lọc theo Loại giảm giá (MỚI)
      // Giả sử DB lưu là 'percent' hoặc 'fixed'
      if (discountType && discountType !== 'all') {
        query.discountType = discountType;
      }
      
      // 3. Tìm kiếm theo mã code
      if (code) {
        query.code = { $regex: code, $options: 'i' };
      }

      // 4. Lọc theo khoảng thời gian (Logic Overlap chuẩn)
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Lấy hết ngày kết thúc

        query.validFrom = { $lte: end };   
        query.expiredAt = { $gte: start }; 
      }

      // Thực hiện query
      const [discounts, totalCount] = await Promise.all([
        Discount.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Discount.countDocuments(query)
      ]);

      res.status(200).json({
        success: true,
        count: totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        data: discounts
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 2. Lấy chi tiết một mã giảm giá qua ID
  getDiscountById: async (req, res) => {
    try {
      const discount = await Discount.findById(req.params.id);
      
      if (!discount) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy mã giảm giá' });
      }

      res.status(200).json({ success: true, data: discount });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 3. Hàm tạo mã giảm giá mới 
  createDiscount: async (req, res) => {
    try {
      // Kiểm tra trùng mã code trước khi tạo
      const existingDiscount = await Discount.findOne({ code: req.body.code.toUpperCase() });
      if (existingDiscount) {
        return res.status(400).json({ success: false, message: 'Mã giảm giá này đã tồn tại' });
      }

      const newDiscount = await Discount.create(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Tạo mã giảm giá thành công',
        data: newDiscount
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 4. Hàm cập nhật mã giảm giá 
  updateDiscount: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Cập nhật và trả về dữ liệu mới nhất (new: true)
      const updatedDiscount = await Discount.findByIdAndUpdate(id, req.body, { 
        new: true,
        runValidators: true 
      });

      if (!updatedDiscount) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy mã giảm giá để cập nhật' });
      }

      res.status(200).json({
        success: true,
        message: 'Cập nhật thành công',
        data: updatedDiscount
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 5. Hàm xóa mã giảm giá 
  deleteDiscount: async (req, res) => {
    try {
      const { id } = req.params;
      const deletedDiscount = await Discount.findByIdAndDelete(id);

      if (!deletedDiscount) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy mã giảm giá để xóa' });
      }

      res.status(200).json({
        success: true,
        message: 'Đã xóa mã giảm giá thành công',
        data: deletedDiscount
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 6. Hàm kiểm tra mã giảm giá hợp lệ (Dành cho trang Checkout)
  checkDiscountValidity: async (req, res) => {
    try {
      const { code, orderValue } = req.body;
      const now = new Date();

      const discount = await Discount.findOne({ 
        code: code.toUpperCase(), 
        status: 'active' 
      });

      if (!discount) {
        return res.status(404).json({ success: false, message: 'Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa' });
      }

      // Kiểm tra thời hạn
      if (now < discount.validFrom || now > discount.expiredAt) {
        return res.status(400).json({ success: false, message: 'Mã giảm giá đã hết hạn hoặc chưa đến thời gian sử dụng' });
      }

      // Kiểm tra giá trị đơn hàng tối thiểu
      if (orderValue < discount.minOrderValue) {
        return res.status(400).json({ 
          success: false, 
          message: `Đơn hàng tối thiểu phải từ ${discount.minOrderValue} để áp dụng mã này` 
        });
      }

      // Kiểm tra lượt sử dụng
      if (discount.usageLimit <= 0) {
        return res.status(400).json({ success: false, message: 'Mã giảm giá đã hết lượt sử dụng' });
      }

      res.status(200).json({
        success: true,
        message: 'Áp dụng mã thành công',
        data: discount
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  
};

module.exports = discountController;