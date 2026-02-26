const Product = require("../models/Products/Product");
const compatibilityService = require("../services/compatibilityService");

/**
 * POST /api/products/build-pc/check-compatibility
 * Kiểm tra tính tương thích của một bộ linh kiện
 */
const checkCompatibility = async (req, res) => {
  try {
    const { components } = req.body; // { cpuId, mainboardId, ramId, gpuId, psuId, caseId }

    if (!components || typeof components !== "object") {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu linh kiện không hợp lệ",
      });
    }

    // Load tất cả product data từ IDs
    const componentData = {};
    const keys = ["cpu", "mainboard", "ram", "gpu", "psu", "case"];
    
    for (const key of keys) {
      if (components[key]) {
        const product = await Product.findById(components[key]).lean();
        if (product) {
          componentData[key] = product;
        }
      }
    }

    const result = await compatibilityService.checkCompatibility(componentData);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Check compatibility error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi kiểm tra tương thích",
    });
  }
};

module.exports = {
  checkCompatibility,
};
