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
    } = req.query;

    // ===== 1. Build filter =====
    const filter = {
      isActive: true,
    };

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

    // ===== 2. Filter theo CATEGORY SLUG =====
    if (category) {
      const slugs = category.split(","); // ["vga", "cpu"]

      const categories = await Category.find({ slug: slugs });

      const categoryIds = categories.map((c) => c._id);

      filter.category = categoryIds;
    }

    // ===== 3. Filter theo BRAND SLUG =====
    if (brand) {
      const slugs = brand.split(",");

      const brands = await Brand.find({ slug: slugs });

      const brandIds = brands.map((b) => b._id);

      filter.brand = brandIds;
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
      case "newest":
      default:
        sortOption = { createdAt: -1 };
        break;
    }

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

module.exports = { getProducts, getProductById, getSimilarProducts };
