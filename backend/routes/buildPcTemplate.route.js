const express = require("express");
const buildPcTemplateController = require("../controller/buildPcTemplateController");
// const {
//   authenticateToken,
//   checkRoleAndStatus,
// } = require("../middleware/authorization");

const router = express.Router();
const { isAuth, checkRoleAndStatus } = require("../middleware/authorization");

// Public routes
router.get("/public", buildPcTemplateController.getPublicTemplates);
router.get("/public/:id", buildPcTemplateController.getPublicTemplateById);


// Tất cả route dưới đây yêu cầu đăng nhập với role staff/admin
// router.use(authenticateToken, checkRoleAndStatus(["staff", "admin"]));

// Tạo cấu hình mẫu
router.post("/",isAuth, buildPcTemplateController.createTemplate);

// List cấu hình mẫu (có phân trang)
router.get("/", isAuth, checkRoleAndStatus(["staff", "admin"]), buildPcTemplateController.getTemplates);

// Xem chi tiết
router.get("/:id",isAuth, buildPcTemplateController.getTemplateById);

// Cập nhật
router.put("/:id",isAuth, buildPcTemplateController.updateTemplate);

// Xóa (soft delete)
router.delete("/:id",isAuth, buildPcTemplateController.deleteTemplate);

module.exports = router;
