const BuildPcTemplate = require("../models/BuildPcTemplate");
const Product = require("../models/Products/Product");
const mongoose = require("mongoose");

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
      const { page = 1, limit = 10, keyword, createdBy, isPublic, minPrice, maxPrice } = req.query;
  
      const matchStage = { isActive: true };
  
      if (keyword) {
        matchStage.$text = { $search: keyword };
      }
  
      if (createdBy) {
        matchStage.createdBy = new mongoose.Types.ObjectId(createdBy);
      }
  
      if (typeof isPublic !== "undefined") {
        matchStage.isPublic = isPublic === "true";
      }

      const componentKeys = ["cpu", "main", "ram", "gpu", "ssd", "hdd", "psu", "case"];
      const lookupStages = componentKeys.map((key) => ({
        $lookup: {
          from: "products",
          localField: `components.${key}`,
          foreignField: "_id",
          as: `${key}Details`,
        },
      }));
  
      const addFieldsStage = {
        $addFields: {
          totalPrice: {
            $sum: componentKeys.map((key) => ({
              $sum: "$" + key + "Details.price",
            })),
          },
        },
      };
      
      if (minPrice || maxPrice) {
        addFieldsStage.$addFields.totalPrice = {
          $sum: componentKeys.map((key) => ({
            $sum: "$" + key + "Details.price",
          })),
        };
        matchStage.totalPrice = {};
        if (minPrice) {
            matchStage.totalPrice.$gte = Number(minPrice);
        }
        if (maxPrice) {
            matchStage.totalPrice.$lte = Number(maxPrice);
        }
      }
  
      const currentPage = Number(page);
      const pageSize = Number(limit);
      const skip = (currentPage - 1) * pageSize;
  
      const aggregation = [
        { $match: matchStage },
        ...lookupStages,
        addFieldsStage,
        {
          $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "_id",
            as: "createdBy",
            pipeline: [
              { $project: { userName: 1, fullName: 1, role: 1 } }
            ]
          }
        },
        { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } },
      ];
  
      const [templates, total] = await Promise.all([
        BuildPcTemplate.aggregate([...aggregation, { $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: pageSize }]),
        BuildPcTemplate.aggregate([...aggregation, { $count: "total" }])
      ]);
  
      const totalCount = total.length > 0 ? total[0].total : 0;
  
      return res.status(200).json({
        success: true,
        data: templates,
        pagination: {
          total: totalCount,
          page: currentPage,
          limit: pageSize,
          totalPages: Math.ceil(totalCount / pageSize),
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

    for (const [key, productValue] of Object.entries(template.components || {})) {
      if (!productValue) continue;

      const productIds = Array.isArray(productValue) ? productValue : [productValue];
      const details = [];

      for (const productId of productIds) {
        const product = await Product.findById(productId)
          .select("name price images specifications")
          .lean();
        if (product) {
          details.push(product);
          totalPrice += product.price || 0;
        }
      }

      if (Array.isArray(productValue)) {
        componentDetails[key] = details;
      } else if (details[0]) {
        componentDetails[key] = details[0];
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

/**
 * GET /api/build-pc-template/public
 * Public: Lấy danh sách cấu hình mẫu công khai
 */
const getPublicTemplates = async (req, res) => {
  try {
    const { page = 1, limit = 9, keyword, minPrice, maxPrice, usageType } = req.query;

    // Luôn lọc các template công khai và đang hoạt động
    const matchStage = {
      isActive: true,
      isPublic: true,
    };

    if (keyword) {
      matchStage.$text = { $search: keyword };
    }

    if (usageType) {
      matchStage.usageType = { $regex: usageType, $options: 'i' };
    }

    const componentKeys = ["cpu", "main", "ram", "gpu", "ssd", "hdd", "psu", "case"];
    const lookupStages = componentKeys.map((key) => ({
      $lookup: {
        from: "products",
        localField: `components.${key}`,
        foreignField: "_id",
        pipeline: [{ $project: { _id: 1, name: 1, price: 1, images: { $slice: ["$images", 1] } } }],
        as: `${key}Details`,
      },
    }));

    const addFieldsStage = {
      $addFields: {
        totalPrice: {
          $sum: componentKeys.map((key) => ({
            $sum: "$" + key + "Details.price",
          })),
        },
        componentDetails: {
          $mergeObjects: componentKeys.map((key) => ({
            $cond: {
              if: { $gt: [{ $size: "$" + key + "Details" }, 0] },
              then: {
                [key]: {
                  $cond: {
                    if: { $in: [key, ["ram", "ssd"]] },
                    then: "$" + key + "Details",
                    else: { $first: "$" + key + "Details" },
                  },
                },
              },
              else: {},
            },
          })),
        },
      },
    };

    const currentPage = Number(page);
    const pageSize = Number(limit);
    const skip = (currentPage - 1) * pageSize;

    const aggregation = [
      { $match: matchStage },
      ...lookupStages,
      addFieldsStage,
    ];

    // Thêm bộ lọc giá sau khi đã tính totalPrice
    if (minPrice || maxPrice) {
      const priceMatch = { totalPrice: {} };
      if (minPrice) priceMatch.totalPrice.$gte = Number(minPrice);
      if (maxPrice) priceMatch.totalPrice.$lte = Number(maxPrice);
      aggregation.push({ $match: priceMatch });
    }

    const [templates, total] = await Promise.all([
      BuildPcTemplate.aggregate([...aggregation, { $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: pageSize }]),
      BuildPcTemplate.aggregate([...aggregation, { $count: "total" }])
    ]);

    const totalCount = total.length > 0 ? total[0].total : 0;

    return res.status(200).json({
      success: true,
      data: templates,
      pagination: {
        total: totalCount,
        page: currentPage,
        limit: pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error) {
    console.error("Get public build PC templates error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách cấu hình mẫu",
    });
  }
};

/**
 * GET /api/build-pc-template/public/:id
 * Public: Xem chi tiết cấu hình mẫu công khai
 */
const getPublicTemplateById = async (req, res) => {
  try {
    const { id } = req.params;

    const template = await BuildPcTemplate.findOne({ _id: id, isPublic: true, isActive: true }).lean();

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy cấu hình mẫu hoặc cấu hình này không công khai.",
      });
    }

    const componentDetails = {};
    let totalPrice = 0;

    for (const [key, productValue] of Object.entries(template.components || {})) {
      if (!productValue) continue;

      const productIds = Array.isArray(productValue) ? productValue : [productValue];
      const details = [];

      for (const productId of productIds) {
        const product = await Product.findById(productId).select("name price images stock").lean();
        if (product) {
          details.push(product);
          totalPrice += product.price || 0;
        }
      }

      if (Array.isArray(productValue)) {
        componentDetails[key] = details;
      } else if (details[0]) {
        componentDetails[key] = details[0];
      }
    }

    return res.status(200).json({
      success: true,
      data: { ...template, components: componentDetails, totalPrice },
    });
  } catch (error) {
    console.error("Get public build PC template by id error:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

module.exports = {
  createTemplate,
  getTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  getPublicTemplates,
  getPublicTemplateById,
};
