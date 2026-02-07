const Discount = require('../../models/Discounts/Discount');

const discountController = {
  // 1. Lấy danh sách mã giảm giá (có phân trang + filter status + date)
getAllDiscounts: async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1;
        let limit = req.query.limit; // Lấy raw value trước
        if (limit === 'all') {
            limit = 0; 
            page = 1;  
        } else {
            limit = parseInt(limit) || 10; // Mặc định là 10 nếu không truyền
        }

        const skip = limit === 0 ? 0 : (page - 1) * limit;
        // Lấy các tham số filter từ query (thêm discountType)
        const { status, code,  discountType } = req.query;
        let query = {};
        // 1. Lọc theo trạng thái
        if (status && status !== 'all') {
            query.status = status;
        }
        // 2. Lọc theo Loại giảm giá
        if (discountType && discountType !== 'all') {
            query.discountType = discountType;
        }       
        // 3. Tìm kiếm theo mã code
        if (code) {
            query.code = { $regex: code, $options: 'i' };
        }
        // Thực hiện query
      const [discounts, totalCount] = await Promise.all([
        Discount.find(query)
          // Sắp xếp theo ngày tạo giảm dần, NẾU ngày trùng nhau thì sắp xếp theo ID
          .sort({ createdAt: -1, _id: -1 }) 
          // --------------------
          .skip(skip)
          .limit(limit),
        Discount.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            count: totalCount,
            currentPage: page,
            // Nếu lấy tất cả (limit=0) thì tổng số trang là 1, ngược lại tính toán bình thường
            totalPages: limit === 0 ? 1 : Math.ceil(totalCount / limit), 
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
      const {code, description, discountType, value, validFrom, expiredAt, minOrderValue, maxDiscountValue, usageLimit} = req.body;
      //Validate trường mã giảm giá
      if(!code){
        return res.status(400).json({success: false, message:"Vui lòng nhập mã giảm giá "})
      }
      if(code.length > 30){
        return res.status(400).json({success: false, message:'Mã giảm giá không quá 30 ký tự'})
      }
      if(code.length < 3){
        return res.status(400).json({success: false, message:'Mã giảm giá phải trên 3 ký tự'})
      }
      //Validate trường chi tiết
      if(!description){
        return res.status(400).json({success: false, message:"Vui lòng nhập thông tin chi tiết"})
      }
      if(description.length > 100){
        return res.status(400).json({success: false, message:"Chi tiết không quá 100 ký tự"})
      }
      //validate trường giá trị tối thiểu để áp dụng mã
      if(!minOrderValue){
        return res.status(400).json({success: false, message:'Vui lòng nhập giá trị tối thiểu để áp dụng mã'})
      }
      if(minOrderValue < 0){
        return res.status(400).json({success: false, message:'Giá trị tối thiểu để áp dụng mã không âm'})
      }
      //validate trường giá trị tối đa được giảm
      if(discountType == 'percent' && !maxDiscountValue){
        return res.status(400).json({success: false, message:'Vui lòng nhập giá trị tối đa được giảm'})
      }
      if(maxDiscountValue < 0){
        return res.status(400).json({success: false, message:'Giá trị tối thiểu để áp dụng mã không âm'})
      }
      //validate trường giới hạn sử dụng
      if(!usageLimit){
        return res.status(400).json({success: false, message:'Vui lòng nhập giới hạn sử dụng của mã'})
      }
      if(usageLimit < 0){
        return res.status(400).json({success: false, message:'Giới hạn sử dụng của mã không âm'})
      }
      //validate trường loại giảm giá
      if(discountType !== 'percent' && discountType !=='fixed'){
        return res.status(400).json({success: false, message:'Loại giảm giá không được để trống hoặc khống đúng định dạng'})
      }
      if(value <= 0){
        return res.status(400).json({success: false, message:'Giá trị giảm giá không được nhỏ hơn hoặc bằng không'})
      }
      if(discountType == 'percent' && value > 100){
        return res.status(400).json({success: false, message:'Phần trăm giảm không được quá 100%'})
      }
      //validate trường thời hạn
      const start = new Date(validFrom);
      const end = new Date(expiredAt);
      const now = new Date();
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return res.status(400).json({ success: false, message: 'Định dạng ngày tháng không hợp lệ (validFrom hoặc expiredAt)' });
      }

      if (start >= end) {
          return res.status(400).json({ success: false, message: 'Ngày kết thúc phải sau ngày bắt đầu' });
      }
      if (end < now) {
          return res.status(400).json({ success: false, message: 'Thời gian kết thúc không được ở trong quá khứ' });
      }  
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