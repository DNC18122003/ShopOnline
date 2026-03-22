import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, ImagePlus, Save, Loader2, Plus, Trash2, Cpu, Monitor, Layers, CircuitBoard, Package } from 'lucide-react';
import { toast } from 'react-toastify';
import { createProduct, uploadImages } from '../../services/product/product.api';
import { getCategories } from '../../services/category/category.api';
import { getBrands } from '../../services/brand/brand.api';

// ========== PRODUCT TYPE OPTIONS ==========
const PRODUCT_TYPES = [
    { key: 'product', label: 'Sản phẩm chung', icon: Package, color: 'gray' },
    { key: 'cpu', label: 'CPU', icon: Cpu, color: 'blue' },
    { key: 'gpu', label: 'GPU (Card màn hình)', icon: Monitor, color: 'green' },
    { key: 'ram', label: 'RAM', icon: Layers, color: 'purple' },
    { key: 'mainboard', label: 'Mainboard', icon: CircuitBoard, color: 'orange' },
];

// ========== SPEC FIELDS PER TYPE ==========
const SPEC_FIELDS_BY_TYPE = {
    product: [
        { key: 'socket', label: 'Socket', placeholder: 'VD: LGA 1700, AM5', type: 'text' },
        { key: 'ram_type', label: 'Loại RAM', placeholder: 'VD: DDR4, DDR5', type: 'text' },
        { key: 'form_factor', label: 'Form Factor', placeholder: 'VD: ATX, mATX, ITX', type: 'text' },
        { key: 'bus', label: 'Bus', placeholder: 'VD: 3200, 5600', type: 'text' },
        { key: 'capacity', label: 'Dung lượng (GB)', placeholder: 'VD: 8, 16, 512, 1000', type: 'number' },
        { key: 'vram', label: 'VRAM', placeholder: 'VD: 8GB GDDR6X', type: 'text' },
        { key: 'wattage', label: 'Công suất (W)', placeholder: 'VD: 650, 750, 850', type: 'number' },
    ],
    cpu: [
        { key: 'socket', label: 'Socket', placeholder: 'VD: LGA 1700, AM5', type: 'text', required: true },
        { key: 'cores', label: 'Số nhân (Cores)', placeholder: 'VD: 8, 16, 24', type: 'number' },
        { key: 'threads', label: 'Số luồng (Threads)', placeholder: 'VD: 16, 32', type: 'number' },
        { key: 'base_clock', label: 'Xung cơ bản (GHz)', placeholder: 'VD: 3.4', type: 'number' },
        { key: 'boost_clock', label: 'Xung boost (GHz)', placeholder: 'VD: 5.6', type: 'number' },
        { key: 'tdp', label: 'TDP (W)', placeholder: 'VD: 125, 170', type: 'number' },
        { key: 'cache', label: 'Cache', placeholder: 'VD: 36MB L3', type: 'text' },
        { key: 'integrated_gpu', label: 'GPU tích hợp', placeholder: 'VD: Intel UHD 770', type: 'text' },
        { key: 'architecture', label: 'Kiến trúc', placeholder: 'VD: Raptor Lake, Zen 4', type: 'text' },
    ],
    gpu: [
        { key: 'vram', label: 'VRAM', placeholder: 'VD: 8GB, 12GB, 24GB', type: 'text', required: true },
        { key: 'core_clock', label: 'Xung core (MHz)', placeholder: 'VD: 2235', type: 'number' },
        { key: 'boost_clock', label: 'Xung boost (MHz)', placeholder: 'VD: 2610', type: 'number' },
        { key: 'tdp', label: 'TDP (W)', placeholder: 'VD: 350, 450', type: 'number' },
        { key: 'cuda_cores', label: 'CUDA Cores', placeholder: 'VD: 16384', type: 'number' },
        { key: 'memory_type', label: 'Loại bộ nhớ', placeholder: 'VD: GDDR6X', type: 'text' },
        { key: 'bus_width', label: 'Bus Width (bit)', placeholder: 'VD: 256, 384', type: 'number' },
        { key: 'length', label: 'Chiều dài (mm)', placeholder: 'VD: 336', type: 'number' },
    ],
    ram: [
        { key: 'ram_type', label: 'Loại RAM', placeholder: 'VD: DDR4, DDR5', type: 'text', required: true },
        { key: 'capacity', label: 'Dung lượng (GB)', placeholder: 'VD: 8, 16, 32', type: 'number', required: true },
        { key: 'bus', label: 'Bus (MHz)', placeholder: 'VD: 3200, 5600', type: 'number' },
        { key: 'sticks', label: 'Số thanh', placeholder: 'VD: 1, 2', type: 'number' },
        { key: 'latency', label: 'Latency', placeholder: 'VD: CL16, CL18', type: 'text' },
        { key: 'voltage', label: 'Voltage (V)', placeholder: 'VD: 1.35', type: 'number' },
        { key: 'rgb', label: 'RGB', placeholder: '', type: 'checkbox' },
    ],
    mainboard: [
        { key: 'socket', label: 'Socket', placeholder: 'VD: LGA 1700, AM5', type: 'text', required: true },
        { key: 'ram_type', label: 'Loại RAM hỗ trợ', placeholder: 'VD: DDR4, DDR5', type: 'text', required: true },
        { key: 'max_ram_capacity', label: 'RAM tối đa (GB)', placeholder: 'VD: 128', type: 'number' },
        { key: 'ram_slots', label: 'Số khe RAM', placeholder: 'VD: 2, 4', type: 'number' },
        { key: 'form_factor', label: 'Form Factor', placeholder: 'VD: ATX, mATX, ITX', type: 'text' },
        { key: 'chipset', label: 'Chipset', placeholder: 'VD: Z790, B650', type: 'text' },
        { key: 'pcie_version', label: 'PCIe Version', placeholder: 'VD: 5.0, 4.0', type: 'text' },
        { key: 'm2_slots', label: 'Số khe M.2', placeholder: 'VD: 2, 3, 4', type: 'number' },
        { key: 'sata_ports', label: 'Số cổng SATA', placeholder: 'VD: 4, 6', type: 'number' },
    ],
};

// ========== TYPE COLORS ==========
const TYPE_COLORS = {
    product: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300', ring: 'ring-gray-400', activeBg: 'bg-gray-600' },
    cpu: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-300', ring: 'ring-blue-400', activeBg: 'bg-blue-600' },
    gpu: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-300', ring: 'ring-green-400', activeBg: 'bg-green-600' },
    ram: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-300', ring: 'ring-purple-400', activeBg: 'bg-purple-600' },
    mainboard: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-300', ring: 'ring-orange-400', activeBg: 'bg-orange-600' },
};

export function CreateProduct() {
    const navigate = useNavigate();

    // ========== STATE ==========
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [productType, setProductType] = useState('product');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        brand: '',
        isActive: true,
    });

    // Khởi tạo specs rỗng cho tất cả types
    const getEmptySpecs = (type) => {
        const fields = SPEC_FIELDS_BY_TYPE[type] || [];
        const specs = {};
        fields.forEach((f) => {
            specs[f.key] = f.type === 'checkbox' ? false : '';
        });
        return specs;
    };

    const [specifications, setSpecifications] = useState(getEmptySpecs('product'));

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
    const handleTypeChange = (type) => {
        setProductType(type);
        setSpecifications(getEmptySpecs(type));
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSpecChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSpecifications((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
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

        // Validate basic fields
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

        // Validate required spec fields cho loại sản phẩm
        const currentSpecFields = SPEC_FIELDS_BY_TYPE[productType] || [];
        for (const field of currentSpecFields) {
            if (field.required && !specifications[field.key] && specifications[field.key] !== 0) {
                toast.error(`Vui lòng nhập ${field.label}`);
                return;
            }
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
                    // Auto-convert number fields
                    const fieldDef = currentSpecFields.find(f => f.key === key);
                    if (fieldDef && fieldDef.type === 'number') {
                        specs[key] = Number(value);
                    } else if (fieldDef && fieldDef.type === 'checkbox') {
                        specs[key] = Boolean(value);
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

            // Create product — gửi productType cho backend
            const productData = {
                productType, // ← field mới
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

    // ========== CURRENT SPEC FIELDS ==========
    const currentSpecFields = SPEC_FIELDS_BY_TYPE[productType] || [];
    const typeColors = TYPE_COLORS[productType] || TYPE_COLORS.product;

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
                    {/* ============ Section 0: Loại Sản Phẩm ============ */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center text-sm font-bold">
                                ★
                            </span>
                            Loại Sản Phẩm
                        </h2>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                            {PRODUCT_TYPES.map((pt) => {
                                const Icon = pt.icon;
                                const isSelected = productType === pt.key;
                                const colors = TYPE_COLORS[pt.key];
                                return (
                                    <button
                                        key={pt.key}
                                        type="button"
                                        onClick={() => handleTypeChange(pt.key)}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                                            isSelected
                                                ? `${colors.border} ${colors.bg} ring-2 ${colors.ring} shadow-md`
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        <Icon className={`w-6 h-6 ${isSelected ? colors.text : 'text-gray-400'}`} />
                                        <span className={`text-sm font-medium ${isSelected ? colors.text : 'text-gray-500'}`}>
                                            {pt.label}
                                        </span>
                                        {isSelected && (
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full text-white ${colors.activeBg}`}>
                                                Đang chọn
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

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

                    {/* ============ Section 5: Thông Số Kỹ Thuật (dynamic) ============ */}
                    <div className={`bg-white rounded-xl shadow-sm border-2 ${typeColors.border} p-6 transition-colors duration-300`}>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <span className={`w-8 h-8 rounded-lg ${typeColors.bg} ${typeColors.text} flex items-center justify-center text-sm font-bold`}>
                                5
                            </span>
                            Thông Số Kỹ Thuật
                            <span className={`text-xs font-normal ml-2 px-2 py-0.5 rounded-full ${typeColors.bg} ${typeColors.text}`}>
                                {PRODUCT_TYPES.find(pt => pt.key === productType)?.label}
                            </span>
                        </h2>
                        <p className="text-xs text-gray-400 mb-5">
                            {productType === 'product'
                                ? 'Điền các thông số chung liên quan đến sản phẩm'
                                : `Các thông số dành riêng cho ${PRODUCT_TYPES.find(pt => pt.key === productType)?.label}. Trường có dấu (*) là bắt buộc.`}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {currentSpecFields.map((field) => (
                                <div key={field.key}>
                                    {field.type === 'checkbox' ? (
                                        <label className="flex items-center gap-3 px-3 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name={field.key}
                                                checked={specifications[field.key] || false}
                                                onChange={handleSpecChange}
                                                className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm font-medium text-gray-600">{field.label}</span>
                                        </label>
                                    ) : (
                                        <>
                                            <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                                {field.label}
                                                {field.required && <span className="text-red-500 ml-1">*</span>}
                                            </label>
                                            <input
                                                type={field.type}
                                                name={field.key}
                                                value={specifications[field.key] || ''}
                                                onChange={handleSpecChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                placeholder={field.placeholder}
                                                min={field.type === 'number' ? '0' : undefined}
                                                step={field.type === 'number' ? 'any' : undefined}
                                                required={field.required}
                                            />
                                        </>
                                    )}
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
