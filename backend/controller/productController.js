const mongoose = require("mongoose");
const Product = require("../models/Products/Product");
const Cpu = require("../models/Products/CPU");
const Gpu = require("../models/Products/GPU");
const Ram = require("../models/Products/RAM");
const Mainboard = require("../models/Products/Mainboard");
const Brand = require("../models/Brands/Brand");
const Category = require("../models/Category/Category");

// ========== HELPER: Chọn model theo productType ==========
const ALL_MODELS = [
  { key: "cpu", model: Cpu },
  { key: "gpu", model: Gpu },
  { key: "ram", model: Ram },
  { key: "mainboard", model: Mainboard },
  { key: "product", model: Product },
];

const getModelByType = (productType) => {
  switch (productType) {
    case "cpu": return Cpu;
    case "gpu": return Gpu;
    case "ram": return Ram;
    case "mainboard": return Mainboard;
    default: return Product;
  }
};

/**
 * Tìm sản phẩm theo ID trong tất cả collections
 * Trả về { model, doc } hoặc null
 */
const findProductAcrossModels = async (id) => {
  for (const { key, model } of ALL_MODELS) {
    const doc = await model.findById(id).lean();
    if (doc) return { key, model, doc };
  }
  return null;
};

/**
 * GET /api/products
 * Lấy danh sách sản phẩm + filter + sort + pagination
 * Query từ tất cả collections
 */
const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 9,
      category,
      brand,
      minPrice,
      maxPrice,
      sort,
      keyword,
      labels,
      productType, // optional: filter chỉ 1 loại
    } = req.query;

    // ===== 1. Build filter =====
    const filter = {};

    // Mặc định chỉ lấy sản phẩm active trừ khi có showAll=true
    if (req.query.showAll !== "true") {
      filter.isActive = true;
    }
    // --- Filter theo Labels ---
    if (labels) {
      const labelArray = labels.split(",");
      filter["labels"] = { $in: labelArray };
    }

    // Filter theo Specs (Socket, RAM Type, Form Factor)
    if (req.query.socket) {
      filter["specifications.socket"] = req.query.socket;
    }
    if (req.query.ram_type) {
      filter["specifications.ram_type"] = req.query.ram_type;
    }
    if (req.query.form_factor) {
      filter["specifications.form_factor"] = req.query.form_factor;
    }

    // ===== 2. Filter theo CATEGORY IDs hoặc SLUGs =====
    if (category) {
      const parts = category.split(",").map((p) => p.trim()).filter(Boolean);
      const objectIds = parts.filter(p => mongoose.Types.ObjectId.isValid(p));
      const slugs = parts.filter(p => !mongoose.Types.ObjectId.isValid(p));

      let categoryIds = [...objectIds];

      if (slugs.length > 0) {
        const categoriesFound = await Category.find({ slug: { $in: slugs } });
        categoryIds = [...categoryIds, ...categoriesFound.map((c) => c._id.toString())];
      }

      categoryIds = [...new Set(categoryIds.map(String))];

      // Nếu client truyền category nhưng không resolve được id nào,
      // trả về rỗng thay vì bỏ filter (tránh bị list all).
      if (categoryIds.length === 0) {
        return res.status(200).json({
          success: true,
          data: [],
          pagination: {
            total: 0,
            page: Number(page),
            limit: Number(limit),
            totalPages: 0,
          },
        });
      }

      filter.category = { $in: categoryIds };
    }

    // ===== 3. Filter theo BRAND IDs hoặc SLUGs =====
    if (brand) {
      const parts = brand.split(",");
      const objectIds = parts.filter(p => mongoose.Types.ObjectId.isValid(p));
      const slugs = parts.filter(p => !mongoose.Types.ObjectId.isValid(p));

      let brandIds = [...objectIds];

      if (slugs.length > 0) {
        const brandsFound = await Brand.find({ slug: { $in: slugs } });
        brandIds = [...brandIds, ...brandsFound.map((b) => b._id)];
      }

      if (brandIds.length > 0) {
        filter.brand = { $in: brandIds };
      }
    }
    // Lọc theo giá
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Tìm kiếm theo tên / mô tả
    if (keyword) {
      filter.$text = { $search: keyword };
    }

    // ===== 2. Sort =====
    let sortOption = { createdAt: -1 }; // mặc định: mới nhất

    switch (sort) {
      case "price_asc":
        sortOption = { price: 1 };
        break;
      case "price_desc":
        sortOption = { price: -1 };
        break;
      case "rating":
        sortOption = { averageRating: -1 };
        break;
      case "updated":
        sortOption = { updatedAt: -1 };
        break;
      case "newest":
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    console.log("Filter:", filter);

    // ===== 3. Pagination =====
    const currentPage = Number(page);
    const pageSize = Number(limit);
    const skip = (currentPage - 1) * pageSize;

    // ===== 4. Chọn models để query =====
    let modelsToQuery;
    if (productType) {
      // Nếu có filter theo productType, chỉ query 1 model
      const Model = getModelByType(productType);
      modelsToQuery = [{ key: productType, model: Model }];
    } else {
      // Query tất cả models
      modelsToQuery = ALL_MODELS;
    }

    // ===== 5. Query tất cả collections song song =====
    const queryPromises = modelsToQuery.map(async ({ key, model }) => {
      const docs = await model.find(filter)
        .populate("brand", "name logo")
        .populate("category", "name slug")
        .sort(sortOption)
        .lean();
      // Đánh dấu productType cho mỗi doc
      return docs.map(doc => ({ ...doc, productType: key }));
    });

    const allResults = await Promise.all(queryPromises);
    let mergedProducts = allResults.flat();

    // Sort lại kết quả merged
    const sortKey = Object.keys(sortOption)[0];
    const sortDir = sortOption[sortKey];
    mergedProducts.sort((a, b) => {
      if (a[sortKey] < b[sortKey]) return -1 * sortDir;
      if (a[sortKey] > b[sortKey]) return 1 * sortDir;
      return 0;
    });

    const total = mergedProducts.length;

    // Pagination trên kết quả merged
    const paginatedProducts = mergedProducts.slice(skip, skip + pageSize);

    // ===== 6. Response =====
    res.status(200).json({
      success: true,
      data: paginatedProducts,
      pagination: {
        total,
        page: currentPage,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm trong tất cả collections
    for (const { key, model } of ALL_MODELS) {
      const product = await model.findOne({
        _id: id,
        isActive: true,
      })
        .populate("brand", "name slug logo")
        .populate("category", "name slug")
        .lean();

      if (product) {
        return res.status(200).json({
          success: true,
          data: { ...product, productType: key },
        });
      }
    }

    return res.status(404).json({
      success: false,
      message: "Không tìm thấy sản phẩm",
    });
  } catch (error) {
    console.error("Get product by id error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

/**
 * GET /api/product/:id/similar
 * Lấy sản phẩm tương tự (cùng category)
 */
const getSimilarProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 4 } = req.query;

    // Tìm sản phẩm hiện tại trong tất cả collections
    const found = await findProductAcrossModels(id);
    if (!found) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    const { doc: product } = found;

    // Tìm sản phẩm cùng category từ tất cả collections
    const similarFilter = {
      category: product.category,
      _id: { $ne: id },
      isActive: true,
    };

    const queryPromises = ALL_MODELS.map(async ({ key, model }) => {
      const docs = await model.find(similarFilter)
        .populate("brand", "name logo")
        .populate("category", "name slug")
        .sort({ averageRating: -1, createdAt: -1 })
        .lean();
      return docs.map(doc => ({ ...doc, productType: key }));
    });

    const allResults = await Promise.all(queryPromises);
    let similarProducts = allResults.flat();

    // Sort by rating & newest, then limit
    similarProducts.sort((a, b) => {
      if (b.averageRating !== a.averageRating) return b.averageRating - a.averageRating;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    similarProducts = similarProducts.slice(0, Number(limit));

    res.status(200).json({
      success: true,
      data: similarProducts,
    });
  } catch (error) {
    console.error("Get similar products error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

/**
 * POST /api/product
 * Tạo sản phẩm mới — dispatch đến đúng model theo productType
 */
const createProduct = async (req, res) => {
  try {
    const { productType, ...productData } = req.body;

    // Đảm bảo các trường số là Number
    if (productData.price) productData.price = Number(productData.price);
    if (productData.stock) productData.stock = Number(productData.stock);

    // Chọn model theo productType
    const Model = getModelByType(productType);

    const newProduct = new Model(productData);
    await newProduct.save();

    res.status(201).json({
      success: true,
      message: "Tạo sản phẩm thành công",
      data: { ...newProduct.toObject(), productType: productType || "product" },
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo sản phẩm",
    });
  }
};

/**
 * PUT /api/product/:id
 * Cập nhật sản phẩm — tìm đúng collection rồi update
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { productType, ...updateData } = req.body;

    // Đảm bảo các trường số là Number nếu có truyền lên
    if (updateData.price !== undefined) updateData.price = Number(updateData.price);
    if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);

    // Nếu frontend gửi productType → dùng model đó
    // Nếu không → tìm trong tất cả collections
    let Model;
    if (productType) {
      Model = getModelByType(productType);
    } else {
      const found = await findProductAcrossModels(id);
      if (!found) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sản phẩm để cập nhật",
        });
      }
      Model = found.model;
    }

    const updatedProduct = await Model.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm để cập nhật",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật sản phẩm thành công",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật sản phẩm",
    });
  }
};

/**
 * DELETE /api/product/:id
 * Xóa sản phẩm — tìm trong tất cả collections
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm và xóa trong tất cả collections
    for (const { model } of ALL_MODELS) {
      const deletedProduct = await model.findByIdAndDelete(id);
      if (deletedProduct) {
        return res.status(200).json({
          success: true,
          message: "Xóa sản phẩm thành công",
        });
      }
    }

    return res.status(404).json({
      success: false,
      message: "Không tìm thấy sản phẩm để xóa",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa sản phẩm",
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getSimilarProducts,
  createProduct,
  updateProduct,
  deleteProduct
};
