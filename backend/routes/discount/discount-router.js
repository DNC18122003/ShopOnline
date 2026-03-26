const express = require("express");
const discountController = require("../../controller/discount/discountController");
const { isAuth } = require("../../middleware/authorization");
const router = express.Router();
// 1. GET: Lấy danh sách mã giảm giá (Có thể filter)
router.get("/", discountController.getAllDiscounts);

// 1.1 GET: Lấy mã giảm giá có sẵn
router.get("/available", discountController.getAvailableDiscounts);

// 2. GET: Lấy chi tiết 1 mã theo ID
router.get("/:id", discountController.getDiscountById);

// 3. POST: Tạo mã giảm giá mới
router.post("/", discountController.createDiscount);

// 4. PUT: Cập nhật mã giảm giá theo ID
router.put("/:id", discountController.updateDiscount);

// 5. DELETE: Xóa mã giảm giá theo ID
router.delete("/:id", discountController.deleteDiscount);

router.post("/check", discountController.checkDiscount);

module.exports = router;
