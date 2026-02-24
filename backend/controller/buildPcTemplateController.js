const BuildPcTemplate = require("../models/BuildPcTemplate");
const Product = require("../models/Products/Product");

/**
 * POST /api/build-pc-template
 * Staff/Admin tạo cấu hình mẫu
 */
const createTemplate = async (req, res) => {
  try {
    const { name, description, usageType, components, isPublic } = req.body;
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Tên cấu hình không được để trống",
      });
    }

    const template = await BuildPcTemplate.create({
      name: name.trim(),
      description: description?.trim() || "",
      usageType: usageType?.trim() || "",
      components: components || {},
      createdBy: userId,
      updatedBy: userId,
      isPublic: isPublic ?? true,
    });

    const populated = await BuildPcTemplate.findById(template._id)
      .populate("createdBy", "userName fullName role")
      .lean();

    return res.status(201).json({
      success: true,
      message: "Tạo cấu hình mẫu thành công",
      data: populated,
    });
  } catch (error) {
    console.error("Create build PC template error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo cấu hình mẫu",
    });
  }
};

/**
 * GET /api/build-pc-template
 * Staff/Admin: list cấu hình mẫu (có filter, pagination)
 */
const getTemplates = async (req, res) => {
  try {
    const { page = 1, limit = 10, keyword, createdBy, isPublic } = req.query;

    const filter = {};

    if (keyword) {
      filter.$text = { $search: keyword };
    }

    if (createdBy) {
      filter.createdBy = createdBy;
    }

    if (typeof isPublic !== "undefined") {
      filter.isPublic = isPublic === "true";
    }

    filter.isActive = true;

    const currentPage = Number(page);
    const pageSize = Number(limit);
    const skip = (currentPage - 1) * pageSize;

    const [templates, total] = await Promise.all([
      BuildPcTemplate.find(filter)
        .populate("createdBy", "userName fullName role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      BuildPcTemplate.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: templates,
      pagination: {
        total,
        page: currentPage,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Get build PC templates error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách cấu hình mẫu",
    });
  }
};

/**
 * GET /api/build-pc-template/:id
 * Staff/Admin xem chi tiết
 */
const getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;

    const template = await BuildPcTemplate.findById(id)
      .populate("createdBy", "userName fullName role")
      .lean();

    if (!template || !template.isActive) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy cấu hình mẫu",
      });
    }

    // Lấy chi tiết sản phẩm hiện tại
    const componentDetails = {};
    let totalPrice = 0;

    for (const [key, productId] of Object.entries(template.components || {})) {
      if (!productId) continue;
      const product = await Product.findById(productId)
        .select("name price images specifications")
        .lean();
      if (product) {
        componentDetails[key] = product;
        totalPrice += product.price || 0;
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        ...template,
        components: componentDetails,
        currentTotalPrice: totalPrice,
      },
    });
  } catch (error) {
    console.error("Get build PC template by id error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

/**
 * PUT /api/build-pc-template/:id
 * Staff/Admin cập nhật cấu hình mẫu
 */
const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, usageType, components, isPublic, isActive } =
      req.body;
    const userId = req.user?._id || req.user?.id;

    const template = await BuildPcTemplate.findById(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy cấu hình mẫu",
      });
    }

    if (name) template.name = name.trim();
    if (typeof description !== "undefined")
      template.description = description?.trim() || "";
    if (typeof usageType !== "undefined")
      template.usageType = usageType?.trim() || "";
    if (components) template.components = components;
    if (typeof isPublic !== "undefined") template.isPublic = !!isPublic;
    if (typeof isActive !== "undefined") template.isActive = !!isActive;
    if (userId) template.updatedBy = userId;

    await template.save();

    const populated = await BuildPcTemplate.findById(template._id)
      .populate("createdBy", "userName fullName role")
      .lean();

    return res.status(200).json({
      success: true,
      message: "Cập nhật cấu hình mẫu thành công",
      data: populated,
    });
  } catch (error) {
    console.error("Update build PC template error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật cấu hình mẫu",
    });
  }
};

/**
 * DELETE /api/build-pc-template/:id
 * Staff/Admin xóa (soft delete) cấu hình mẫu
 */
const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    const template = await BuildPcTemplate.findById(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy cấu hình mẫu",
      });
    }

    template.isActive = false;
    await template.save();

    return res.status(200).json({
      success: true,
      message: "Xóa cấu hình mẫu thành công",
    });
  } catch (error) {
    console.error("Delete build PC template error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa cấu hình mẫu",
    });
  }
};

module.exports = {
  createTemplate,
  getTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
};

