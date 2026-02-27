import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Package, Loader2, ImagePlus, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { getProducts, updateProduct, deleteProduct, uploadImages } from '../../services/product/product.api';
import { getCategories } from '../../services/category/category.api';
import { getBrands } from '../../services/brand/brand.api';

// ========== FORMAT HELPERS ==========
const formatPrice = (value) => {
    if (!value && value !== 0) return '0';
    return Number(value).toLocaleString('vi-VN');
};

export function ProductManagement() {
    const navigate = useNavigate();

    // ========== STATE ==========
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
    });

    // Edit modal state
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    const [editFormData, setEditFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        brand: '',
        isActive: true,
    });

    // Image editing state
    const [existingImages, setExistingImages] = useState([]); // URLs from DB
    const [newImageFiles, setNewImageFiles] = useState([]);
    const [newImagePreviews, setNewImagePreviews] = useState([]);
    const [uploading, setUploading] = useState(false);

    // ========== FETCH PRODUCTS ==========
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: 10,
                keyword: searchTerm || undefined,
                showAll: true,
            };

            const response = await getProducts(params);
            if (response.success) {
                setProducts(response.data);
                setPagination(response.pagination);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Không thể tải danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    // ========== FETCH CATEGORIES & BRANDS (for edit modal) ==========
    const fetchCategoriesAndBrands = async () => {
        try {
            const [catRes, brandRes] = await Promise.all([getCategories({ limit: 100 }), getBrands({ limit: 100 })]);
            if (catRes.success) setCategories(catRes.data);
            if (brandRes.success) setBrands(brandRes.data);
        } catch (error) {
            console.error('Error loading categories/brands:', error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [currentPage, searchTerm]);

    useEffect(() => {
        fetchCategoriesAndBrands();
    }, []);

    // ========== HANDLERS ==========
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    // Toggle product status
    const toggleStatus = async (product) => {
        try {
            const response = await updateProduct(product._id, { isActive: !product.isActive });
            if (response.success) {
                toast.success('Cập nhật trạng thái thành công');
                fetchProducts();
            }
        } catch (error) {
            console.error('Error toggling status:', error);
            toast.error('Không thể cập nhật trạng thái');
        }
    };

    // Delete product
    const handleDeleteProduct = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            try {
                const response = await deleteProduct(id);
                if (response.success) {
                    toast.success('Xóa sản phẩm thành công');
                    fetchProducts();
                }
            } catch (error) {
                console.error('Error deleting product:', error);
                toast.error('Không thể xóa sản phẩm');
            }
        }
    };

    // Open edit modal
    const openEditModal = (product) => {
        setEditingProduct(product);
        setEditFormData({
            name: product.name || '',
            description: product.description || '',
            price: product.price || '',
            stock: product.stock || '',
            category: product.category?._id || '',
            brand: product.brand?._id || '',
            isActive: product.isActive,
        });
        setExistingImages(product.images || []);
        setNewImageFiles([]);
        setNewImagePreviews([]);
        setShowEditModal(true);
    };

    // Handle edit form change
    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    // ========== IMAGE EDIT HANDLERS ==========
    const removeExistingImage = (index) => {
        setExistingImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleNewImageSelect = (e) => {
        const files = Array.from(e.target.files);
        const totalImages = existingImages.length + newImageFiles.length + files.length;

        if (totalImages > 5) {
            toast.error('Tối đa 5 ảnh');
            return;
        }

        const validFiles = files.filter((file) => {
            if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
                toast.error(`${file.name}: Chỉ hỗ trợ JPEG/JPG/PNG`);
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name}: Kích thước tối đa 5MB`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        setNewImageFiles((prev) => [...prev, ...validFiles]);

        validFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewImagePreviews((prev) => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeNewImage = (index) => {
        setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
        setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    // Submit edit
    const handleEditSubmit = async (e) => {
        e.preventDefault();

        if (!editFormData.name.trim()) {
            toast.error('Vui lòng nhập tên sản phẩm');
            return;
        }
        if (!editFormData.price || Number(editFormData.price) < 0) {
            toast.error('Vui lòng nhập giá hợp lệ');
            return;
        }

        try {
            setSaving(true);
            let uploadedUrls = [];

            // Upload new images if any
            if (newImageFiles.length > 0) {
                setUploading(true);
                const formData = new FormData();
                newImageFiles.forEach((file) => formData.append('images', file));

                try {
                    const uploadRes = await uploadImages(formData);
                    uploadedUrls = uploadRes.images.map((img) => img.Url);
                } catch (uploadErr) {
                    console.error('Upload error:', uploadErr);
                    toast.error('Lỗi khi upload ảnh');
                    return;
                } finally {
                    setUploading(false);
                }
            }

            const finalImages = [...existingImages, ...uploadedUrls];

            const data = {
                name: editFormData.name.trim(),
                description: editFormData.description.trim(),
                price: Number(editFormData.price),
                stock: Number(editFormData.stock),
                category: editFormData.category,
                brand: editFormData.brand,
                isActive: editFormData.isActive,
                images: finalImages,
            };

            const response = await updateProduct(editingProduct._id, data);
            if (response.success) {
                toast.success('Cập nhật sản phẩm thành công');
                setShowEditModal(false);
                setEditingProduct(null);
                fetchProducts();
            }
        } catch (error) {
            console.error('Error updating product:', error);
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật';
            toast.error(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    // Close edit modal
    const handleCloseModal = () => {
        setShowEditModal(false);
        setEditingProduct(null);
    };

    // ========== RENDER ==========
    return (
        <>
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Quản Lý Sản Phẩm</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Quản lý toàn bộ sản phẩm trong hệ thống ({pagination.total} sản phẩm)
                        </p>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="p-8">
                {/* Search & Add Button */}
                <div className="flex items-center justify-between mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={() => navigate('/staff/products/create')}
                        className="ml-4 flex items-center space-x-2 px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Tạo Sản Phẩm Mới</span>
                    </button>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">Không có sản phẩm nào</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Sản Phẩm
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Danh Mục
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Thương Hiệu
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Giá
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Tồn Kho
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Trạng Thái
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Thao Tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {products.map((product) => (
                                        <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                                            {/* Product name + thumbnail */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                                                        {product.images && product.images.length > 0 ? (
                                                            <img
                                                                src={product.images[0]}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Package className="w-5 h-5 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-gray-800 truncate max-w-xs">
                                                            {product.name}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-0.5">
                                                            {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Category */}
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                                    {product.category?.name || '—'}
                                                </span>
                                            </td>
                                            {/* Brand */}
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-700">
                                                    {product.brand?.name || '—'}
                                                </span>
                                            </td>
                                            {/* Price */}
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-semibold text-gray-800">
                                                    {formatPrice(product.price)}₫
                                                </span>
                                            </td>
                                            {/* Stock */}
                                            <td className="px-6 py-4 text-center">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                                        product.stock > 10
                                                            ? 'bg-green-100 text-green-700'
                                                            : product.stock > 0
                                                              ? 'bg-yellow-100 text-yellow-700'
                                                              : 'bg-red-100 text-red-700'
                                                    }`}
                                                >
                                                    {product.stock}
                                                </span>
                                            </td>
                                            {/* Status Toggle */}
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => toggleStatus(product)}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                        product.isActive ? 'bg-blue-500' : 'bg-gray-300'
                                                    }`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                            product.isActive ? 'translate-x-6' : 'translate-x-1'
                                                        }`}
                                                    />
                                                </button>
                                            </td>
                                            {/* Actions */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center space-x-3">
                                                    <button
                                                        onClick={() => openEditModal(product)}
                                                        className="text-blue-500 hover:text-blue-700 transition-colors"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit2 className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProduct(product._id)}
                                                        className="text-red-500 hover:text-red-700 transition-colors"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {pagination.total > 0 && (
                    <div className="mt-6 flex items-center justify-center">
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            {Array.from({ length: pagination.totalPages || 1 }, (_, index) => index + 1).map(
                                (pageNum) => (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                            currentPage === pageNum
                                                ? 'bg-blue-500 text-white'
                                                : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                ),
                            )}

                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(pagination.totalPages || 1, prev + 1))}
                                disabled={currentPage === (pagination.totalPages || 1)}
                                className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-fadeIn max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Chỉnh Sửa Sản Phẩm</h2>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Tên Sản Phẩm <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={editFormData.name}
                                    onChange={handleEditChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Mô Tả</label>
                                <textarea
                                    name="description"
                                    value={editFormData.description}
                                    onChange={handleEditChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows="3"
                                />
                            </div>
                            {/* Price & Stock */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Giá (VNĐ) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={editFormData.price}
                                        onChange={handleEditChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        min="0"
                                        required
                                    />
                                    {editFormData.price && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            ≈ {formatPrice(editFormData.price)}₫
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Tồn Kho <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={editFormData.stock}
                                        onChange={handleEditChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>
                            {/* Category & Brand */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Danh Mục <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="category"
                                        value={editFormData.category}
                                        onChange={handleEditChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                        required
                                    >
                                        <option value="">-- Chọn --</option>
                                        {categories
                                            .filter((cat) => cat.isActive)
                                            .map((cat) => (
                                                <option key={cat._id} value={cat._id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Thương Hiệu <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="brand"
                                        value={editFormData.brand}
                                        onChange={handleEditChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                        required
                                    >
                                        <option value="">-- Chọn --</option>
                                        {brands
                                            .filter((b) => b.isActive)
                                            .map((b) => (
                                                <option key={b._id} value={b._id}>
                                                    {b.name}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            </div>
                            {/* Images */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Hình Ảnh{' '}
                                    <span className="text-xs text-gray-400 font-normal">
                                        (Tối đa 5 ảnh, JPEG/PNG, ≤ 5MB)
                                    </span>
                                </label>
                                <div className="grid grid-cols-5 gap-3">
                                    {/* Existing images */}
                                    {existingImages.map((url, index) => (
                                        <div
                                            key={`existing-${index}`}
                                            className="relative group aspect-square rounded-xl border-2 border-gray-200 overflow-hidden"
                                        >
                                            <img
                                                src={url}
                                                alt={`Ảnh ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            {index === 0 && (
                                                <span className="absolute top-1 left-1 bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-semibold">
                                                    Chính
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {/* New image previews */}
                                    {newImagePreviews.map((preview, index) => (
                                        <div
                                            key={`new-${index}`}
                                            className="relative group aspect-square rounded-xl border-2 border-green-300 overflow-hidden"
                                        >
                                            <img
                                                src={preview}
                                                alt={`Ảnh mới ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <span className="absolute bottom-1 left-1 bg-green-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-semibold">
                                                Mới
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removeNewImage(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {/* Upload button */}
                                    {existingImages.length + newImageFiles.length < 5 && (
                                        <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-blue-50 group">
                                            <ImagePlus className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                            <span className="text-[10px] text-gray-400 mt-1 group-hover:text-blue-500">
                                                Thêm
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/jpg,image/png"
                                                multiple
                                                onChange={handleNewImageSelect}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                            {/* isActive */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="editIsActive"
                                    name="isActive"
                                    checked={editFormData.isActive}
                                    onChange={handleEditChange}
                                    className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="editIsActive" className="text-sm font-medium text-gray-700">
                                    Kích hoạt sản phẩm
                                </label>
                            </div>
                            {/* Actions */}
                            <div className="flex items-center justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    disabled={saving}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    disabled={saving}
                                >
                                    {saving || uploading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            {uploading ? 'Đang upload ảnh...' : 'Đang lưu...'}
                                        </>
                                    ) : (
                                        'Cập Nhật'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
