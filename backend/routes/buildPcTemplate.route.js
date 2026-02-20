const express = require("express");
const buildPcTemplateController = require("../controller/buildPcTemplateController");
const {
  authenticateToken,
  checkRoleAndStatus,
} = require("../middleware/authorization");

const router = express.Router();

// Tất cả route dưới đây yêu cầu đăng nhập với role staff/admin
router.use(authenticateToken, checkRoleAndStatus(["staff", "admin"]));

// Tạo cấu hình mẫu
router.post("/", buildPcTemplateController.createTemplate);

// List cấu hình mẫu (có phân trang)
router.get("/", buildPcTemplateController.getTemplates);

// Xem chi tiết
router.get("/:id", buildPcTemplateController.getTemplateById);

// Cập nhật
router.put("/:id", buildPcTemplateController.updateTemplate);

// Xóa (soft delete)
router.delete("/:id", buildPcTemplateController.deleteTemplate);

module.exports = router;

