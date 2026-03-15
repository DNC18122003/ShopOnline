const mongoose = require("mongoose");
const Product = require("../models/Products/Product");
const Brand = require("../models/Brands/Brand");
const Category = require("../models/Category/Category");

/**
 * GET /api/products
 * Lấy danh sách sản phẩm + filter + sort + pagination
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
      labels
    } = req.query;
   // console.log("Query params:", req.query);
    // ===== 1. Build filter =====
    const filter = {};

    // Mặc định chỉ lấy sản phẩm active trừ khi có showAll=true
    if (req.query.showAll !== "true") {
      filter.isActive = true;
    }
    // --- Filter theo Labels (Mới bổ sung) ---
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
      const parts = category.split(",");
      const objectIds = parts.filter(p => mongoose.Types.ObjectId.isValid(p));
      const slugs = parts.filter(p => !mongoose.Types.ObjectId.isValid(p));

      let categoryIds = [...objectIds];

      if (slugs.length > 0) {
        const categoriesFound = await Category.find({ slug: { $in: slugs } });
        categoryIds = [...categoryIds, ...categoriesFound.map((c) => c._id)];
      }

      if (categoryIds.length > 0) {
        filter.category = { $in: categoryIds };
      }
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
    // test
    console.log("Filter:", filter);

    // ===== 3. Pagination =====
    const currentPage = Number(page);
    const pageSize = Number(limit);
    const skip = (currentPage - 1) * pageSize;

    // ===== 4. Query DB =====
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("brand", "name logo")
        .populate("category", "name slug")
        .sort(sortOption)
        .skip(skip)
        .limit(pageSize)
        .lean(),

      Product.countDocuments(filter),
    ]);

    // ===== 5. Response =====
    res.status(200).json({
      success: true,
      data: products,
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

    const product = await Product.findOne({
      _id: id,
      isActive: true,
    })
      .populate("brand", "name slug logo")
      .populate("category", "name slug")
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
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

    // Tìm sản phẩm hiện tại
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    // Tìm sản phẩm cùng category, loại trừ sản phẩm hiện tại
    const similarProducts = await Product.find({
      category: product.category,
      _id: { $ne: id }, // không lấy chính sản phẩm đó
      isActive: true,
    })
      .populate("brand", "name logo")
      .populate("category", "name slug")
      .limit(Number(limit))
      .sort({ averageRating: -1, createdAt: -1 }) // ưu tiên rating cao và mới nhất
      .lean();

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
 * Tạo sản phẩm mới
 */
const createProduct = async (req, res) => {
  try {
    const productData = req.body;
    
    // Đảm bảo các trường số là Number
    if (productData.price) productData.price = Number(productData.price);
    if (productData.stock) productData.stock = Number(productData.stock);

    const newProduct = new Product(productData);
    await newProduct.save();

    res.status(201).json({
      success: true,
      message: "Tạo sản phẩm thành công",
      data: newProduct,
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
 * Cập nhật sản phẩm
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Đảm bảo các trường số là Number nếu có truyền lên
    if (updateData.price !== undefined) updateData.price = Number(updateData.price);
    if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);

    const updatedProduct = await Product.findByIdAndUpdate(
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
 * Xóa sản phẩm
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm để xóa",
      });
    }

    res.status(200).json({
      success: true,
      message: "Xóa sản phẩm thành công",
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
