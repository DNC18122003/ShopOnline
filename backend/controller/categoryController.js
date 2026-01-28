const Category = require("../models/Category/Category");

/**
 * GET /api/categories
 * Lấy danh sách tất cả các danh mục
 */
const getCategories = async (req, res) => {
    try {
        const { page = 1, limit = 10, keyword, isActive } = req.query;

        // Build filter
        const filter = {};

        // Filter theo trạng thái active
        if (isActive !== undefined) {
            filter.isActive = isActive === "true";
        }

        // Tìm kiếm theo tên
        if (keyword) {
            filter.name = { $regex: keyword, $options: "i" };
        }

        // Pagination
        const currentPage = Number(page);
        const pageSize = Number(limit);
        const skip = (currentPage - 1) * pageSize;

        // Query DB
        const [categories, total] = await Promise.all([
            Category.find(filter)
                .sort({ name: 1 })
                .skip(skip)
                .limit(pageSize)
                .lean(),

            Category.countDocuments(filter),
        ]);

        res.status(200).json({
            success: true,
            data: categories,
            pagination: {
                total,
                page: currentPage,
                limit: pageSize,
                totalPages: Math.ceil(total / pageSize),
            },
        });
    } catch (error) {
        console.error("Get categories error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server",
        });
    }
};

/**
 * GET /api/categories/:id
 * Lấy thông tin chi tiết một danh mục
 */
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id).lean();

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy danh mục",
            });
        }

        res.status(200).json({
            success: true,
            data: category,
        });
    } catch (error) {
        console.error("Get category by id error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server",
        });
    }
};

/**
 * GET /api/categories/slug/:slug
 * Lấy thông tin danh mục theo slug
 */
const getCategoryBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const category = await Category.findOne({ slug }).lean();

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy danh mục",
            });
        }

        res.status(200).json({
            success: true,
            data: category,
        });
    } catch (error) {
        console.error("Get category by slug error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server",
        });
    }
};

/**
 * POST /api/categories
 * Tạo danh mục mới
 */
const createCategory = async (req, res) => {
    try {
        const { name, slug, description, isActive } = req.body;

        // Validate
        if (!name || !slug) {
            return res.status(400).json({
                success: false,
                message: "Tên và slug là bắt buộc",
            });
        }

        // Kiểm tra slug đã tồn tại chưa
        const existingCategory = await Category.findOne({ slug });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Slug đã tồn tại",
            });
        }

        // Tạo category mới
        const newCategory = new Category({
            name,
            slug,
            description,
            isActive,
        });

        await newCategory.save();

        res.status(201).json({
            success: true,
            message: "Tạo danh mục thành công",
            data: newCategory,
        });
    } catch (error) {
        console.error("Create category error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server",
        });
    }
};

/**
 * PUT /api/categories/:id
 * Cập nhật thông tin danh mục
 */
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug, description, isActive } = req.body;

        // Kiểm tra category có tồn tại không
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy danh mục",
            });
        }

        // Nếu thay đổi slug, kiểm tra slug mới có bị trùng không
        if (slug && slug !== category.slug) {
            const existingCategory = await Category.findOne({ slug });
            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: "Slug đã tồn tại",
                });
            }
        }

        // Cập nhật
        if (name) category.name = name;
        if (slug) category.slug = slug;
        if (description !== undefined) category.description = description;
        if (isActive !== undefined) category.isActive = isActive;

        await category.save();

        res.status(200).json({
            success: true,
            message: "Cập nhật danh mục thành công",
            data: category,
        });
    } catch (error) {
        console.error("Update category error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server",
        });
    }
};

/**
 * DELETE /api/categories/:id
 * Xóa danh mục (soft delete)
 */
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy danh mục",
            });
        }

        // Soft delete: set isActive = false
        category.isActive = false;
        await category.save();

        res.status(200).json({
            success: true,
            message: "Xóa danh mục thành công",
        });
    } catch (error) {
        console.error("Delete category error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server",
        });
    }
};

module.exports = {
    getCategories,
    getCategoryById,
    getCategoryBySlug,
    createCategory,
    updateCategory,
    deleteCategory,
};
