import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, ImagePlus, Save, Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { createProduct, uploadImages } from '../../services/product/product.api';
import { getCategories } from '../../services/category/category.api';
import { getBrands } from '../../services/brand/brand.api';

// ========== CONSTANTS ==========
const SPEC_FIELDS = [
    { key: 'socket', label: 'Socket', placeholder: 'VD: LGA 1700, AM5', type: 'text' },
    { key: 'ram_type', label: 'Loại RAM', placeholder: 'VD: DDR4, DDR5', type: 'text' },
    { key: 'form_factor', label: 'Form Factor', placeholder: 'VD: ATX, mATX, ITX', type: 'text' },
    { key: 'bus', label: 'Bus', placeholder: 'VD: 3200, 5600', type: 'text' },
    { key: 'capacity', label: 'Dung lượng (GB)', placeholder: 'VD: 8, 16, 512, 1000', type: 'number' },
    { key: 'vram', label: 'VRAM', placeholder: 'VD: 8GB GDDR6X', type: 'text' },
    { key: 'wattage', label: 'Công suất (W)', placeholder: 'VD: 650, 750, 850', type: 'number' },
];

export function CreateProduct() {
    const navigate = useNavigate();

    // ========== STATE ==========
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        brand: '',
        isActive: true,
    });

    const [specifications, setSpecifications] = useState({
        socket: '',
        ram_type: '',
        form_factor: '',
        bus: '',
        capacity: '',
        vram: '',
        wattage: '',
    });

    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    // Dynamic detail specifications (detail_json)
    const [detailSpecs, setDetailSpecs] = useState([{ key: '', value: '' }]);

    // ========== LOAD CATEGORIES & BRANDS ==========
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, brandRes] = await Promise.all([
                    getCategories({ limit: 100 }),
                    getBrands({ limit: 100 }),
                ]);
                if (catRes.success) setCategories(catRes.data);
                if (brandRes.success) setBrands(brandRes.data);
            } catch (error) {
                console.error('Error loading categories/brands:', error);
                toast.error('Không thể tải danh mục/thương hiệu');
            }
        };
        fetchData();
    }, []);

    // ========== HANDLERS ==========
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSpecChange = (e) => {
        const { name, value } = e.target;
        setSpecifications((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // ========== DETAIL SPECS HANDLERS ==========
    const addDetailSpec = () => {
        setDetailSpecs((prev) => [...prev, { key: '', value: '' }]);
    };

    const removeDetailSpec = (index) => {
        setDetailSpecs((prev) => prev.filter((_, i) => i !== index));
    };

    const handleDetailSpecChange = (index, field, value) => {
        setDetailSpecs((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        const totalImages = imageFiles.length + files.length;

        if (totalImages > 5) {
            toast.error('Tối đa 5 ảnh');
            return;
        }

        // Validate file types
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

        setImageFiles((prev) => [...prev, ...validFiles]);

        // Preview
        validFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews((prev) => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setImageFiles((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    // ========== FORMAT PRICE ==========
    const formatPrice = (value) => {
        if (!value) return '';
        return Number(value).toLocaleString('vi-VN');
    };

    // ========== SUBMIT ==========
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate
        if (!formData.name.trim()) {
            toast.error('Vui lòng nhập tên sản phẩm');
            return;
        }
        if (!formData.price || Number(formData.price) < 0) {
            toast.error('Vui lòng nhập giá hợp lệ');
            return;
        }
        if (formData.stock === '' || Number(formData.stock) < 0) {
            toast.error('Vui lòng nhập số lượng tồn kho hợp lệ');
            return;
        }
        if (!formData.category) {
            toast.error('Vui lòng chọn danh mục');
            return;
        }
        if (!formData.brand) {
            toast.error('Vui lòng chọn thương hiệu');
            return;
        }

        try {
            setLoading(true);
            let imageUrls = [];

            // Upload images first if any
            if (imageFiles.length > 0) {
                setUploading(true);
                const uploadFormData = new FormData();
                imageFiles.forEach((file) => {
                    uploadFormData.append('images', file);
                });

                try {
                    const uploadRes = await uploadImages(uploadFormData);
                    imageUrls = uploadRes.images.map((img) => img.Url);
                } catch (uploadErr) {
                    console.error('Upload error:', uploadErr);
                    toast.error('Lỗi khi upload ảnh');
                    return;
                } finally {
                    setUploading(false);
                }
            }

            // Build specifications (only include non-empty fields)
            const specs = {};
            Object.entries(specifications).forEach(([key, value]) => {
                if (value !== '' && value !== null && value !== undefined) {
                    if (['capacity', 'wattage'].includes(key)) {
                        specs[key] = Number(value);
                    } else {
                        specs[key] = value;
                    }
                }
            });

            // Build detail_json from dynamic specs
            const detailJson = {};
            detailSpecs.forEach(({ key, value }) => {
                if (key.trim() && value.trim()) {
                    detailJson[key.trim()] = value.trim();
                }
            });
            if (Object.keys(detailJson).length > 0) {
                specs.detail_json = detailJson;
            }

            // Create product
            const productData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                price: Number(formData.price),
                stock: Number(formData.stock),
                category: formData.category,
                brand: formData.brand,
                isActive: formData.isActive,
                images: imageUrls,
                specifications: Object.keys(specs).length > 0 ? specs : undefined,
            };

            const response = await createProduct(productData);
            if (response.success) {
                toast.success('Tạo sản phẩm thành công!');
            }
        } catch (error) {
            console.error('Error creating product:', error);
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tạo sản phẩm';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // ========== RENDER ==========
    return (
        <>
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-8 py-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Tạo Sản Phẩm Mới</h1>
                        <p className="text-sm text-gray-500 mt-1">Thêm sản phẩm mới vào kho hàng</p>
                    </div>
                </div>
            </header>

            {/* Form Content */}
            <div className="p-8">
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
                    {/* ============ Section 1: Thông tin cơ bản ============ */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                                1
                            </span>
                            Thông Tin Cơ Bản
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Tên Sản Phẩm <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="VD: Card Màn Hình NVIDIA RTX 4090"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Mô Tả</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Mô tả chi tiết về sản phẩm..."
                                    rows="4"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ============ Section 2: Giá & Tồn kho ============ */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">
                                2
                            </span>
                            Giá & Tồn Kho
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Giá Bán (VNĐ) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="VD: 45990000"
                                    min="0"
                                    required
                                />
                                {formData.price && (
                                    <p className="text-xs text-gray-500 mt-1">≈ {formatPrice(formData.price)}₫</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Tồn Kho <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="VD: 50"
                                    min="0"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* ============ Section 3: Phân Loại ============ */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">
                                3
                            </span>
                            Phân Loại
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Danh Mục <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                    required
                                >
                                    <option value="">-- Chọn danh mục --</option>
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
                                    value={formData.brand}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                    required
                                >
                                    <option value="">-- Chọn thương hiệu --</option>
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
                    </div>

                    {/* ============ Section 4: Hình Ảnh ============ */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold">
                                4
                            </span>
                            Hình Ảnh
                            <span className="text-xs text-gray-400 font-normal ml-2">
                                (Tối đa 5 ảnh, JPEG/PNG, ≤ 5MB)
                            </span>
                        </h2>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                            {/* Image Previews */}
                            {imagePreviews.map((preview, index) => (
                                <div
                                    key={index}
                                    className="relative group aspect-square rounded-xl border-2 border-gray-200 overflow-hidden"
                                >
                                    <img
                                        src={preview}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    {index === 0 && (
                                        <span className="absolute top-2 left-2 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                                            Chính
                                        </span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}

                            {/* Upload Button */}
                            {imageFiles.length < 5 && (
                                <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-blue-50 group">
                                    <ImagePlus className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                    <span className="text-xs text-gray-400 mt-2 group-hover:text-blue-500">
                                        Thêm ảnh
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png"
                                        multiple
                                        onChange={handleImageSelect}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* ============ Section 5: Thông Số Kỹ Thuật ============ */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center text-sm font-bold">
                                5
                            </span>
                            Thông Số Kỹ Thuật
                        </h2>
                        <p className="text-xs text-gray-400 mb-5">Chỉ điền các thông số liên quan đến loại sản phẩm</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {SPEC_FIELDS.map((field) => (
                                <div key={field.key}>
                                    <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                        {field.label}
                                    </label>
                                    <input
                                        type={field.type}
                                        name={field.key}
                                        value={specifications[field.key]}
                                        onChange={handleSpecChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        placeholder={field.placeholder}
                                        min={field.type === 'number' ? '0' : undefined}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ============ Section 6: Thông Số Chi Tiết (detail_json) ============ */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">
                                6
                            </span>
                            Thông Số Chi Tiết
                        </h2>
                        <p className="text-xs text-gray-400 mb-5">
                            Thêm các thông số hiển thị trên trang sản phẩm (VD: Chip GPU, Boost Clock, CUDA Cores...)
                        </p>

                        <div className="space-y-3">
                            {detailSpecs.map((spec, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={spec.key}
                                        onChange={(e) => handleDetailSpecChange(index, 'key', e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        placeholder="Tên thông số (VD: Chip GPU)"
                                    />
                                    <input
                                        type="text"
                                        value={spec.value}
                                        onChange={(e) => handleDetailSpecChange(index, 'value', e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        placeholder="Giá trị (VD: NVIDIA RTX 4090)"
                                    />
                                    {detailSpecs.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeDetailSpec(index)}
                                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={addDetailSpec}
                            className="mt-4 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Thêm thông số
                        </button>
                    </div>

                    {/* ============ Section 7: Trạng Thái & Submit ============ */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                                    Kích hoạt sản phẩm (hiển thị trên trang web)
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* ============ Action Buttons ============ */}
                    <div className="flex items-center justify-end gap-3 pb-8">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            disabled={loading || uploading}
                        >
                            {loading || uploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {uploading ? 'Đang upload ảnh...' : 'Đang tạo...'}
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Tạo Sản Phẩm
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
