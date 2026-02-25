import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { getBrands, createBrand, updateBrand, deleteBrand } from '../../services/brand/brand.api';

export function BrandManagement() {
    // State management
    const [brands, setBrands] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingBrand, setEditingBrand] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
    });

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        isActive: true,
    });

    // Fetch brands from backend
    const fetchBrands = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: 10,
                keyword: searchTerm,
            };

            const response = await getBrands(params);

            if (response.success) {
                setBrands(response.data);
                setPagination(response.pagination);
            }
        } catch (error) {
            console.error('Error fetching brands:', error);
            toast.error('Không thể tải danh sách thương hiệu');
        } finally {
            setLoading(false);
        }
    };

    // Load brands on mount and when dependencies change
    useEffect(() => {
        fetchBrands();
    }, [currentPage, searchTerm]);

    // Generate slug from name (Vietnamese support)
    const generateSlug = (name) => {
        if (!name) return '';

        const from = 'àáãảạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđùúủũụưừứửữựòóỏõọôồốổỗộơờớởỡợìíỉĩịäëïîöüûñçýỳỹỵỷ';
        const to = 'aaaaaaaaaaaaaaaaaeeeeeeeeeeeduuuuuuuuuuuoooooooooooooooooiiiiiaeiiouuncyyyyy';

        let slug = name.toLowerCase().trim();

        for (let i = 0; i < from.length; i++) {
            slug = slug.replace(new RegExp(from[i], 'g'), to[i]);
        }

        slug = slug
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');

        return slug;
    };

    // Handle name change and auto-generate slug
    const handleNameChange = (e) => {
        const name = e.target.value;
        setFormData({
            ...formData,
            name,
            slug: generateSlug(name),
        });
    };

    // Handle other input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Toggle brand status
    const toggleStatus = async (id, currentStatus) => {
        try {
            const response = await updateBrand(id, { isActive: !currentStatus });
            if (response.success) {
                toast.success('Cập nhật trạng thái thành công');
                fetchBrands();
            }
        } catch (error) {
            console.error('Error toggling status:', error);
            toast.error('Không thể cập nhật trạng thái');
        }
    };

    // Delete brand
    const handleDeleteBrand = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa thương hiệu này?')) {
            try {
                const response = await deleteBrand(id);
                if (response.success) {
                    toast.success('Xóa thương hiệu thành công');
                    fetchBrands();
                }
            } catch (error) {
                console.error('Error deleting brand:', error);
                toast.error('Không thể xóa thương hiệu');
            }
        }
    };

    // Edit brand
    const editBrand = (brand) => {
        setEditingBrand(brand);
        setFormData({
            name: brand.name,
            slug: brand.slug,
            description: brand.description || '',
            isActive: brand.isActive,
        });
        setShowAddModal(true);
    };

    // Submit form (Create or Update)
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim()) {
            toast.error('Vui lòng nhập tên thương hiệu');
            return;
        }

        if (!formData.slug.trim()) {
            toast.error('Vui lòng nhập slug');
            return;
        }

        try {
            setLoading(true);

            if (editingBrand) {
                // Update existing brand
                const response = await updateBrand(editingBrand._id, formData);
                if (response.success) {
                    toast.success('Cập nhật thương hiệu thành công');
                    setShowAddModal(false);
                    fetchBrands();
                    resetForm();
                }
            } else {
                // Create new brand
                const response = await createBrand(formData);
                if (response.success) {
                    toast.success('Tạo thương hiệu thành công');
                    setShowAddModal(false);
                    fetchBrands();
                    resetForm();
                }
            }
        } catch (error) {
            console.error('Error saving brand:', error);
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            slug: '',
            description: '',
            isActive: true,
        });
        setEditingBrand(null);
    };

    // Handle modal close
    const handleCloseModal = () => {
        setShowAddModal(false);
        resetForm();
    };

    return (
        <>
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Quản Lý Thương Hiệu</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Quản lý thương hiệu sản phẩm và tổ chức kho hàng của bạn
                        </p>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="p-8">
                {/* Search and Add Button */}
                <div className="flex items-center justify-between mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm thương hiệu..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowAddModal(true);
                        }}
                        className="ml-4 flex items-center space-x-2 px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Thêm Thương Hiệu Mới</span>
                    </button>
                </div>

                {/* Brands Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        </div>
                    ) : brands.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Không có thương hiệu nào</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Tên Thương Hiệu
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Slug
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Mô Tả
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Trạng Thái
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Thao Tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {brands.map((brand) => (
                                    <tr key={brand._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-gray-800">{brand.name}</p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(brand.createdAt).toLocaleDateString('vi-VN')}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">{brand.slug}</code>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600 max-w-xs truncate">
                                                {brand.description || 'Chưa có mô tả'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleStatus(brand._id, brand.isActive)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                    brand.isActive ? 'bg-blue-500' : 'bg-gray-300'
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        brand.isActive ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                                />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    onClick={() => editBrand(brand)}
                                                    className="text-blue-500 hover:text-blue-700 transition-colors"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteBrand(brand._id)}
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
                    )}
                </div>

                {/* Pagination */}
                {pagination.total > 0 && (
                    <div className="mt-6 flex items-center justify-center">
                        <div className="flex items-center space-x-2">
                            {/* Previous Button */}
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            {/* Page Numbers */}
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

                            {/* Next Button */}
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

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                            {editingBrand ? 'Chỉnh Sửa Thương Hiệu' : 'Thêm Thương Hiệu Mới'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Tên Thương Hiệu <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleNameChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Nhập tên thương hiệu"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Slug <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                                    placeholder="Tự động tạo từ tên"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Slug sẽ được tạo tự động từ tên thương hiệu
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Mô Tả</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Nhập mô tả thương hiệu"
                                    rows="3"
                                />
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                                    Kích hoạt thương hiệu
                                </label>
                            </div>
                            <div className="flex items-center justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    disabled={loading}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loading}
                                >
                                    {loading ? 'Đang xử lý...' : editingBrand ? 'Cập Nhật' : 'Tạo Mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
