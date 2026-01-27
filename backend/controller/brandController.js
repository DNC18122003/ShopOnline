const Brand = require("../models/Brands/Brand");

/**
 * GET /api/brands
 * Lấy danh sách tất cả các thương hiệu
 */
const getBrands = async (req, res) => {
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
        const [brands, total] = await Promise.all([
            Brand.find(filter)
                .sort({ name: 1 })
                .skip(skip)
                .limit(pageSize)
                .lean(),

            Brand.countDocuments(filter),
        ]);

        res.status(200).json({
            success: true,
            data: brands,
            pagination: {
                total,
                page: currentPage,
                limit: pageSize,
                totalPages: Math.ceil(total / pageSize),
            },
        });
    } catch (error) {
        console.error("Get brands error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server",
        });
    }
};

/**
 * GET /api/brands/:id
 * Lấy thông tin chi tiết một thương hiệu
 */
const getBrandById = async (req, res) => {
    try {
        const { id } = req.params;

        const brand = await Brand.findById(id).lean();

        if (!brand) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy thương hiệu",
            });
        }

        res.status(200).json({
            success: true,
            data: brand,
        });
    } catch (error) {
        console.error("Get brand by id error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server",
        });
    }
};

/**
 * GET /api/brands/slug/:slug
 * Lấy thông tin thương hiệu theo slug
 */
const getBrandBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const brand = await Brand.findOne({ slug }).lean();

        if (!brand) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy thương hiệu",
            });
        }

        res.status(200).json({
            success: true,
            data: brand,
        });
    } catch (error) {
        console.error("Get brand by slug error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server",
        });
    }
};

/**
 * POST /api/brands
 * Tạo thương hiệu mới
 */
const createBrand = async (req, res) => {
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
        const existingBrand = await Brand.findOne({ slug });
        if (existingBrand) {
            return res.status(400).json({
                success: false,
                message: "Slug đã tồn tại",
            });
        }

        // Tạo brand mới
        const newBrand = new Brand({
            name,
            slug,
            description,
            isActive,
        });

        await newBrand.save();

        res.status(201).json({
            success: true,
            message: "Tạo thương hiệu thành công",
            data: newBrand,
        });
    } catch (error) {
        console.error("Create brand error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server",
        });
    }
};

/**
 * PUT /api/brands/:id
 * Cập nhật thông tin thương hiệu
 */
const updateBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug, description, isActive } = req.body;

        // Kiểm tra brand có tồn tại không
        const brand = await Brand.findById(id);
        if (!brand) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy thương hiệu",
            });
        }

        // Nếu thay đổi slug, kiểm tra slug mới có bị trùng không
        if (slug && slug !== brand.slug) {
            const existingBrand = await Brand.findOne({ slug });
            if (existingBrand) {
                return res.status(400).json({
                    success: false,
                    message: "Slug đã tồn tại",
                });
            }
        }

        // Cập nhật
        if (name) brand.name = name;
        if (slug) brand.slug = slug;
        if (description !== undefined) brand.description = description;
        if (isActive !== undefined) brand.isActive = isActive;

        await brand.save();

        res.status(200).json({
            success: true,
            message: "Cập nhật thương hiệu thành công",
            data: brand,
        });
    } catch (error) {
        console.error("Update brand error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server",
        });
    }
};

/**
 * DELETE /api/brands/:id
 * Xóa thương hiệu (soft delete)
 */
const deleteBrand = async (req, res) => {
    try {
        const { id } = req.params;

        const brand = await Brand.findById(id);
        if (!brand) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy thương hiệu",
            });
        }

        // Soft delete: set isActive = false
        brand.isActive = false;
        await brand.save();

        res.status(200).json({
            success: true,
            message: "Xóa thương hiệu thành công",
        });
    } catch (error) {
        console.error("Delete brand error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server",
        });
    }
};

module.exports = {
    getBrands,
    getBrandById,
    getBrandBySlug,
    createBrand,
    updateBrand,
    deleteBrand,
};
