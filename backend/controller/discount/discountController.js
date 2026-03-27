const Discount = require("../../models/Discounts/Discount");

const discountController = {
  // 1. Lấy danh sách mã giảm giá
  getAllDiscounts: async (req, res) => {
    try {
      // Sắp xếp theo ngày tạo mới nhất trước, nếu cùng ngày thì sắp xếp theo ID giảm dần
      const discounts = await Discount.find().sort({ createdAt: -1, _id: -1 });

      res.status(200).json({
        success: true,
        count: discounts.length,
        data: discounts,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi máy chủ: " + error.message,
      });
    }
  },
  // 2. Lấy chi tiết một mã giảm giá qua ID
  getDiscountById: async (req, res) => {
    try {
      const discount = await Discount.findById(req.params.id);

      if (!discount) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy mã giảm giá",
        });
      }

      res.status(200).json({
        success: true,
        data: discount,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // 3. Hàm tạo mã giảm giá mới
  createDiscount: async (req, res) => {
    try {
      const {
        code,
        description,
        discountType,
        value,
        validFrom,
        expiredAt,
        minOrderValue,
        maxDiscountValue,
        usageLimit,
      } = req.body;

      // 1. Validate trường mã giảm giá (Bắt buộc)
      if (code === undefined || code === null || String(code).trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập mã giảm giá",
        });
      }
      const codeUpper = String(code).trim().toUpperCase();
      if (codeUpper.length > 30) {
        return res.status(400).json({
          success: false,
          message: "Mã giảm giá không quá 30 ký tự",
        });
      }
      if (codeUpper.length < 3) {
        return res.status(400).json({
          success: false,
          message: "Mã giảm giá phải từ 3 ký tự trở lên",
        });
      }

      // 2. Validate trường chi tiết (Bắt buộc)
      if (
        description === undefined ||
        description === null ||
        String(description).trim() === ""
      ) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập thông tin chi tiết",
        });
      }
      if (description.length > 100) {
        return res
          .status(400)
          .json({ success: false, message: "Chi tiết không quá 100 ký tự" });
      }

      // 3. Validate trường loại giảm giá (Bắt buộc)
      if (
        discountType === undefined ||
        discountType === null ||
        discountType === ""
      ) {
        return res.status(400).json({
          success: false,
          message: "Loại giảm giá không được để trống",
        });
      }
      if (discountType !== "percent" && discountType !== "fixed") {
        return res.status(400).json({
          success: false,
          message: "Loại giảm giá không đúng định dạng (percent hoặc fixed)",
        });
      }

      // 4. Validate trường giá trị giảm giá  (Bắt buộc)
      if (value === undefined || value === null || value === "") {
        return res.status(400).json({
          success: false,
          message: "Giá trị giảm giá không được để trống",
        });
      }
      if (value <= 0) {
        return res
          .status(400)
          .json({ success: false, message: "Giá trị giảm giá phải lớn hơn 0" });
      }
      if (discountType === "percent" && value > 100) {
        return res.status(400).json({
          success: false,
          message: "Phần trăm giảm không được quá 100%",
        });
      }

      // 5. Validate trường giá trị tối thiểu (Bắt buộc)
      if (
        minOrderValue === undefined ||
        minOrderValue === null ||
        minOrderValue === ""
      ) {
        return res.status(400).json({
          success: false,
          message: "Giá trị tối thiểu không được để trống",
        });
      }
      if (minOrderValue < 0) {
        return res.status(400).json({
          success: false,
          message: "Giá trị tối thiểu để áp dụng mã không âm",
        });
      }

      // 6. Validate trường giá trị tối đa được giảm (Bắt buộc)
      // Nếu là percent thì bắt buộc phải có maxDiscountValue
      if (discountType === "percent") {
        if (
          maxDiscountValue === undefined ||
          maxDiscountValue === null ||
          maxDiscountValue === ""
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Vui lòng nhập giá trị giảm tối đa (Bắt buộc với loại Phần trăm)",
          });
        }
      }
      // Giá trị tối đa truyền lên thì không được âm
      if (
        maxDiscountValue !== undefined &&
        maxDiscountValue !== null &&
        maxDiscountValue !== ""
      ) {
        if (maxDiscountValue < 0) {
          return res.status(400).json({
            success: false,
            message: "Giá trị giảm tối đa không âm",
          });
        }
      }

      // 7. Validate trường giới hạn sử dụng (Bắt buộc)
      if (
        usageLimit === undefined ||
        usageLimit === null ||
        usageLimit === ""
      ) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập giới hạn sử dụng của mã",
        });
      }
      if (usageLimit < 0) {
        return res.status(400).json({
          success: false,
          message: "Giới hạn sử dụng của mã không âm",
        });
      }

      // 8. Validate trường thời hạn
      if (!validFrom || !expiredAt) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập đầy đủ ngày bắt đầu và kết thúc",
        });
      }
      const start = new Date(validFrom);
      const end = new Date(expiredAt);
      const now = new Date();
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          message:
            "Định dạng ngày tháng không hợp lệ (validFrom hoặc expiredAt)",
        });
      }
      if (start >= end) {
        return res.status(400).json({
          success: false,
          message: "Ngày kết thúc phải sau ngày bắt đầu",
        });
      }
      if (end < now) {
        return res.status(400).json({
          success: false,
          message: "Thời gian kết thúc không được ở trong quá khứ",
        });
      }

      // 9. Kiểm tra trùng mã code trước khi tạo
      const existingDiscount = await Discount.findOne({ code: codeUpper });
      if (existingDiscount) {
        return res.status(400).json({
          success: false,
          message: "Mã giảm giá này đã tồn tại",
        });
      }

      // Lưu với mã đã chuẩn hóa in hoa
      const newDiscountData = { ...req.body, code: codeUpper };
      const newDiscount = await Discount.create(newDiscountData);

      res.status(201).json({
        success: true,
        message: "Tạo mã giảm giá thành công",
        data: newDiscount,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // 4. Hàm cập nhật mã giảm giá
  updateDiscount: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        code,
        description,
        discountType,
        value,
        validFrom,
        expiredAt,
        minOrderValue,
        maxDiscountValue,
        usageLimit,
        status,
      } = req.body;

      // Lấy thông tin mã cũ để đối chiếu
      const currentDiscount = await Discount.findById(id);
      if (!currentDiscount) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy mã giảm giá để cập nhật",
        });
      }

      const updateData = { ...req.body };

      // VALIDATE DỮ LIỆU
      // 1. Validate mã giảm giá (Chỉ check nếu có truyền)
      if (code !== undefined) {
        if (code === null || String(code).trim() === "") {
          return res.status(400).json({
            success: false,
            message: "Mã giảm giá không được để trống",
          });
        }
        const codeUpper = String(code).trim().toUpperCase();
        if (codeUpper.length > 30)
          return res.status(400).json({
            success: false,
            message: "Mã giảm giá không quá 30 ký tự",
          });
        if (codeUpper.length < 3)
          return res.status(400).json({
            success: false,
            message: "Mã giảm giá phải trên 3 ký tự",
          });

        // Kiểm tra trùng code
        const duplicateDiscount = await Discount.findOne({
          code: codeUpper,
          _id: { $ne: id },
        });
        if (duplicateDiscount) {
          return res.status(400).json({
            success: false,
            message: "Mã giảm giá mới bị trùng với một mã đã tồn tại khác",
          });
        }
        updateData.code = codeUpper;
      }

      // 2. Validate trường chi tiết
      if (description !== undefined) {
        if (description === null || String(description).trim() === "") {
          return res.status(400).json({
            success: false,
            message: "Thông tin chi tiết không được để trống",
          });
        }
        if (description.length > 100)
          return res.status(400).json({
            success: false,
            message: "Chi tiết không quá 100 ký tự",
          });
      }

      // 3. Validate Loại giảm giá
      if (discountType !== undefined) {
        if (discountType === null || discountType === "") {
          return res.status(400).json({
            success: false,
            message: "Loại giảm giá không được để trống",
          });
        }
        if (discountType !== "percent" && discountType !== "fixed") {
          return res.status(400).json({
            success: false,
            message: "Loại giảm giá không đúng định dạng",
          });
        }
      }

      // 4. Validate Các giá trị tối thiểu
      if (minOrderValue !== undefined) {
        if (minOrderValue === "" || minOrderValue === null)
          return res.status(400).json({
            success: false,
            message: "Giá trị tối thiểu không được để trống",
          });
        if (minOrderValue < 0)
          return res.status(400).json({
            success: false,
            message: "Giá trị tối thiểu không âm",
          });
      }
      //4. Validate Các giá trị tối đa
      if (maxDiscountValue !== undefined) {
        if (maxDiscountValue === "" || maxDiscountValue === null)
          return res.status(400).json({
            success: false,
            message: "Giá trị giảm tối đa không được để trống",
          });
        if (maxDiscountValue < 0)
          return res
            .status(400)
            .json({ success: false, message: "Giá trị giảm tối đa không âm" });
      }
      //4. Validate Các giá trị giới hạn
      if (usageLimit !== undefined) {
        if (usageLimit === "" || usageLimit === null)
          return res.status(400).json({
            success: false,
            message: "Giới hạn sử dụng không được để trống",
          });
        if (usageLimit < 0)
          return res
            .status(400)
            .json({ success: false, message: "Giới hạn sử dụng không âm" });
      }
      //4. Validate Các giá trị giảm giá
      if (value !== undefined) {
        if (value === "" || value === null)
          return res.status(400).json({
            success: false,
            message: "Giá trị giảm giá không được để trống",
          });
        if (value <= 0)
          return res.status(400).json({
            success: false,
            message: "Giá trị giảm giá phải lớn hơn 0",
          });
      }

      // 5. Validate Logic Loại giảm giá & Phần trăm
      const typeToCheck =
        discountType !== undefined
          ? discountType
          : currentDiscount.discountType;
      const valueToCheck = value !== undefined ? value : currentDiscount.value;
      const maxDiscountValueToCheck =
        maxDiscountValue !== undefined
          ? maxDiscountValue
          : currentDiscount.maxDiscountValue;

      if (typeToCheck === "percent") {
        if (valueToCheck > 100) {
          return res.status(400).json({
            success: false,
            message: "Phần trăm giảm không được quá 100%",
          });
        }
        if (
          maxDiscountValueToCheck === undefined ||
          maxDiscountValueToCheck === null ||
          maxDiscountValueToCheck === ""
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Vui lòng nhập giá trị giảm tối đa (bắt buộc với loại Phần trăm)",
          });
        }
      }

      // 6. Validate Ngày tháng
      if (validFrom !== undefined || expiredAt !== undefined) {
        const startDateStr =
          validFrom !== undefined ? validFrom : currentDiscount.validFrom;
        const endDateStr =
          expiredAt !== undefined ? expiredAt : currentDiscount.expiredAt;

        const start = new Date(startDateStr);
        const end = new Date(endDateStr);
        const now = new Date();

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Định dạng ngày tháng không hợp lệ",
          });
        }
        if (start >= end) {
          return res.status(400).json({
            success: false,
            message: "Ngày kết thúc phải sau ngày bắt đầu",
          });
        }
        if (expiredAt !== undefined && end < now) {
          return res.status(400).json({
            success: false,
            message: "Thời gian kết thúc mới không được ở trong quá khứ",
          });
        }
      }

      // Thực hiện update
      const updatedDiscount = await Discount.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      res.status(200).json({
        success: true,
        message: "Cập nhật thành công",
        data: updatedDiscount,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // 5. Hàm xóa mã giảm giá
  deleteDiscount: async (req, res) => {
    try {
      const { id } = req.params;
      const deletedDiscount = await Discount.findByIdAndDelete(id);

      if (!deletedDiscount) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy mã giảm giá để xóa",
        });
      }

      res.status(200).json({
        success: true,
        message: "Đã xóa mã giảm giá thành công",
        data: deletedDiscount,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // 6.Lấy danh sách mã giảm giá có sẵn (đơn giản, không phân quyền user)
  getAvailableDiscounts: async (req, res) => {
    try {
      const { orderValue } = req.query;
      const now = new Date();

      const query = {
        status: "active",
        validFrom: { $lte: now },
        expiredAt: { $gte: now },
        usageLimit: { $gt: 0 },
      };

      if (orderValue && !isNaN(Number(orderValue))) {
        query.minOrderValue = { $lte: Number(orderValue) };
      }

      const discounts = await Discount.find(query)
        .select(
          "code discountType value maxDiscountValue minOrderValue description validFrom expiredAt"
        )
        .sort({ value: -1, discountType: 1 })
        .limit(12)
        .lean();

      res.status(200).json({
        success: true,
        count: discounts.length,
        data: discounts,
      });
    } catch (error) {
      console.error("getAvailableDiscounts error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server",
      });
    }
  },

  checkDiscount: async (req, res) => {
    try {
      const { code, orderValue } = req.body;

      if (!code)
        return res
          .status(400)
          .json({ success: false, message: "Vui lòng nhập mã giảm giá" });

      if (!orderValue || isNaN(orderValue))
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập giá trị đơn hàng hợp lệ",
        });

      // Tìm mã giảm giá đang active
      const discount = await Discount.findOne({
        code: code.toUpperCase(),
        status: "active",
      });

      if (!discount)
        return res
          .status(404)
          .json({ success: false, message: "Mã giảm giá không tồn tại" });

      const now = new Date();

      // Check thời gian hiệu lực
      if (discount.validFrom && discount.validFrom > now)
        return res
          .status(400)
          .json({ success: false, message: "Mã chưa được kích hoạt" });

      if (discount.expiredAt && discount.expiredAt < now)
        return res
          .status(400)
          .json({ success: false, message: "Mã đã hết hạn" });

      if (discount.usedCount >= discount.usageLimit)
        return res
          .status(400)
          .json({ success: false, message: "Mã giảm giá đã hết lượt sử dụng" });

      if (discount.minOrderValue && orderValue < discount.minOrderValue)
        return res.status(400).json({
          success: false,
          message: `Đơn hàng phải từ ${discount.minOrderValue} trở lên để áp dụng mã`,
        });

      // Tính giá trị giảm
      let calculatedDiscount = 0;
      if (discount.discountType === "percent") {
        calculatedDiscount = orderValue * (discount.value / 100);
      } else if (discount.discountType === "fixed") {
        calculatedDiscount = discount.value;
      }

      if (discount.maxDiscountValue) {
        calculatedDiscount = Math.min(
          calculatedDiscount,
          discount.maxDiscountValue
        );
      }

      calculatedDiscount = Math.floor(calculatedDiscount / 1000) * 1000;

      return res.json({
        success: true,
        data: {
          code: discount.code,
          discountType: discount.discountType,
          value: discount.value,
          maxDiscountValue: discount.maxDiscountValue,
          minOrderValue: discount.minOrderValue,
          calculatedDiscount,
        },
      });
    } catch (err) {
      console.error("checkDiscount error:", err);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi kiểm tra mã giảm giá",
      });
    }
  },
};

module.exports = discountController;
