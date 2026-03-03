import { useEffect, useState, useRef, useCallback } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, ChevronLeft, ChevronRight, X, Check, Loader2, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  getBuildPcTemplates,
  createBuildPcTemplate,
  updateBuildPcTemplate,
  deleteBuildPcTemplate,
  getBuildPcTemplateById,
} from '@/services/buildPcTemplate.api';
import { getProducts, getProductById } from '@/services/product/product.api';

const EMPTY_COMPONENTS = {
  cpu: '',
  main: '',
  ram: '',
  gpu: '',
  ssd: '',
  hdd: '',
  psu: '',
  case: '',
};

const COMPONENT_CATEGORIES = {
  cpu: 'cpu',
  main: 'mainboard',
  ram: 'ram',
  gpu: 'vga',
  ssd: 'ssd',
  hdd: 'hdd',
  psu: 'psu',
  case: 'case',
};

// Helper function to get spec value
const getSpec = (product, key) => {
  if (!product?.specifications) return null;

  if (product.specifications[key] !== undefined && product.specifications[key] !== null && product.specifications[key] !== '') {
    return product.specifications[key];
  }

  const detail = product.specifications.detail_json || {};
  const aliasesByKey = {
    socket: ['Socket', 'socket', 'Loại Socket'],
    ram_type: ['Hỗ trợ RAM', 'Loại RAM', 'ram_type', 'RAM'],
    form_factor: ['Kích thước mainboard', 'Chuẩn mainboard', 'form_factor'],
  };

  const possibleKeys = aliasesByKey[key] || [key];
  for (const k of possibleKeys) {
    if (detail[k] !== undefined && detail[k] !== null && detail[k] !== '') return detail[k];
  }

  return null;
};

const getWattage = (product) => {
    if (!product?.specifications) return 0;
    const wattage = product.specifications.wattage || product.specifications.power;
    if (typeof wattage === 'number') return wattage;
    if (typeof wattage === 'string') {
        const parsed = parseInt(String(wattage).replace(/W/i, '').trim(), 10);
        return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
};


function ComponentSelect({ label, value, displayValue, categorySlug, onSelect, selectedPrice, constraints = {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);
  const constraintsString = JSON.stringify(constraints);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        fetchProducts();
      }, 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, searchTerm, constraintsString]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts({
        page: 1,
        limit: 20,
        category: categorySlug,
        keyword: searchTerm,
        ...constraints,
      });
      if (res.success) {
        setOptions(res.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
        {label}
      </label>
      <div
        className="w-full px-3 py-2 border border-gray-300 rounded-lg cursor-pointer bg-white flex justify-between items-center hover:border-blue-500 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1 min-w-0 flex justify-between items-center mr-2">
          <span className={`text-sm truncate ${value ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
            {value ? displayValue || value : 'Chọn linh kiện...'}
          </span>
          {value && typeof selectedPrice === 'number' && (
            <span className="text-sm font-bold text-blue-600 ml-2">{selectedPrice.toLocaleString()} ₫</span>
          )}
        </div>
        <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 flex flex-col animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 border-b border-gray-100 sticky top-0 bg-white rounded-t-lg z-20">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {loading ? (
              <div className="p-4 flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              </div>
            ) : options.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Không tìm thấy sản phẩm
              </div>
            ) : (
              options.map((product) => (
                <div
                  key={product._id}
                  className={`p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 flex items-center gap-3 transition-colors ${
                    value === product._id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    onSelect(product);
                    setIsOpen(false);
                  }}
                >
                  <div className="w-10 h-10 bg-gray-100 rounded flex-shrink-0 overflow-hidden border border-gray-200">
                     {product.images?.[0] && <img src={product.images[0]} className="w-full h-full object-contain" alt="" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                    <p className="text-xs text-blue-600 font-semibold">{product.price?.toLocaleString()} ₫</p>
                  </div>
                  {value === product._id && <Check className="w-4 h-4 text-blue-600" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function BuildPcTemplateManagement() {
  const [templates, setTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [componentNames, setComponentNames] = useState({}); // Store names for display { id: name }
  const [componentPrices, setComponentPrices] = useState({}); // Store prices { id: price }
  const [selectedProducts, setSelectedProducts] = useState({}); // Store full product objects

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    usageType: '',
    isPublic: true,
    components: { ...EMPTY_COMPONENTS },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      usageType: '',
      isPublic: true,
      components: { ...EMPTY_COMPONENTS },
    });
    setEditingTemplate(null);
    setComponentNames({});
    setComponentPrices({});
    setSelectedProducts({});
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        keyword: searchTerm,
      };
      const res = await getBuildPcTemplates(params);
      if (res.success) {
        setTemplates(res.data || []);
        setPagination(res.pagination || pagination);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Không thể tải danh sách cấu hình mẫu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm]);

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = async (template) => {
    setEditingTemplate(template);
    const initialComponents = {
      ...EMPTY_COMPONENTS,
      ...(template.components || {}),
    };
    
    setFormData({
      name: template.name,
      description: template.description || '',
      usageType: template.usageType || '',
      isPublic: template.isPublic,
      components: initialComponents,
    });
    setShowModal(true);
  
    // Fetch names and full product data for existing component IDs
    const names = {};
    const prices = {};
    const products = {};
    const promises = Object.entries(initialComponents).map(async ([key, id]) => {
      if (id) {
        try {
          const res = await getProductById(id);
          if (res.success && res.data) {
            names[id] = res.data.name;
            prices[id] = res.data.price;
            products[key] = res.data;
          }
        } catch (err) {
          console.error(`Could not fetch product for ID ${id}`, err);
        }
      }
    });
  
    await Promise.all(promises);
    setComponentNames((prev) => ({ ...prev, ...names }));
    setComponentPrices((prev) => ({ ...prev, ...prices }));
    setSelectedProducts(products);
  };

  const openDetailModal = async (template) => {
    setSelectedTemplate(template);
    setShowDetailModal(true);
    setDetailLoading(true);
    try {
      const res = await getBuildPcTemplateById(template._id);
      if (res.success) {
        setSelectedTemplate(res.data);
      } else {
        toast.error('Không thể tải chi tiết cấu hình');
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error('Error fetching template details:', error);
      toast.error('Lỗi khi tải chi tiết cấu hình');
      setShowDetailModal(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleComponentSelect = (key, product) => {
    // If selecting a mainboard or CPU, dependent components might become incompatible.
    // A more advanced implementation could clear them. For now, we just update.
    setFormData((prev) => ({
      ...prev,
      components: {
        ...prev.components,
        [key]: product._id,
      },
    }));
    setComponentNames((prev) => ({ ...prev, [product._id]: product.name }));
    setComponentPrices((prev) => ({ ...prev, [product._id]: product.price }));
    setSelectedProducts((prev) => ({ ...prev, [key]: product }));
  };

  const getConstraints = useCallback((componentKey) => {
    const constraints = {};
    if (componentKey === 'main') {
      const cpuSocket = getSpec(selectedProducts.cpu, 'socket');
      if (cpuSocket) constraints.socket = cpuSocket;
    } else if (componentKey === 'ram') {
      const mainRamType = getSpec(selectedProducts.main, 'ram_type');
      if (mainRamType) {
        constraints.ram_type = mainRamType;
      } else {
        const cpuRamType = getSpec(selectedProducts.cpu, 'ram_type');
        if (cpuRamType) constraints.ram_type = cpuRamType;
      }
    } else if (componentKey === 'case') {
      const mainForm = getSpec(selectedProducts.main, 'form_factor');
      if (mainForm) constraints.form_factor = mainForm;
    } else if (componentKey === 'cpu') {
      const mainSocket = getSpec(selectedProducts.main, 'socket');
      if (mainSocket) constraints.socket = mainSocket;
    } else if (componentKey === 'psu') {
      const totalWattage = Object.keys(selectedProducts)
        .filter(k => k !== 'psu' && selectedProducts[k])
        .reduce((sum, k) => sum + getWattage(selectedProducts[k]), 0);
      
      if (totalWattage > 0) {
        // Recommend 30% overhead and round up to nearest 50W
        const recommendedWattage = Math.ceil((totalWattage * 1.3) / 50) * 50;
        constraints.min_wattage = recommendedWattage;
      }
    }
    return constraints;
  }, [selectedProducts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên cấu hình mẫu');
      return;
    }

    // Validate all components are selected
    const missingComponents = Object.keys(EMPTY_COMPONENTS)
      .filter((key) => !formData.components[key])
      .map((key) => key.toUpperCase());

    if (missingComponents.length > 0) {
      toast.error(`Vui lòng chọn đầy đủ các linh kiện: ${missingComponents.join(', ')}`);
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        usageType: formData.usageType.trim(),
        isPublic: formData.isPublic,
        components: formData.components,
      };

      if (editingTemplate) {
        const res = await updateBuildPcTemplate(editingTemplate._id, payload);
        if (res.success) {
          toast.success('Cập nhật cấu hình mẫu thành công');
          setShowModal(false);
          resetForm();
          fetchTemplates();
        }
      } else {
        const res = await createBuildPcTemplate(payload);
        if (res.success) {
          toast.success('Tạo cấu hình mẫu thành công');
          setShowModal(false);
          resetForm();
          fetchTemplates();
        }
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi lưu cấu hình mẫu');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa cấu hình mẫu này?')) return;
    try {
      const res = await deleteBuildPcTemplate(id);
      if (res.success) {
        toast.success('Xóa cấu hình mẫu thành công');
        fetchTemplates();
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error(error.response?.data?.message || 'Không thể xóa cấu hình mẫu');
    }
  };

  const renderComponentsSummary = (components = {}) => {
    const entries = Object.entries(components).filter(([, v]) => v);
    if (!entries.length) return 'Chưa cấu hình linh kiện';
    return entries
      .map(([key]) => key.toUpperCase())
      .join(' • ');
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Cấu Hình Mẫu PC</h1>
            <p className="text-sm text-gray-500 mt-1">
              Tạo và quản lý các cấu hình PC mẫu cho nhân viên tư vấn và bán hàng.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-8">
        {/* Search + Add */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên cấu hình..."
              value={searchTerm}
              onChange={(e) => {
                setCurrentPage(1);
                setSearchTerm(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={openCreateModal}
            className="ml-4 flex items-center space-x-2 px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Tạo Cấu Hình Mới</span>
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Chưa có cấu hình mẫu nào</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tên cấu hình
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Mục đích
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Linh kiện
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Công khai
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {templates.map((tpl) => (
                  <tr key={tpl._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-800">{tpl.name}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(tpl.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">
                        {tpl.usageType || 'Chưa đặt mục đích'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-600">
                        {renderComponentsSummary(tpl.components)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          tpl.isPublic
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {tpl.isPublic ? 'Công khai' : 'Nội bộ'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => openDetailModal(tpl)}
                          className="text-gray-600 hover:text-gray-800 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openEditModal(tpl)}
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(tpl._id)}
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
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: pagination.totalPages || 1 }, (_, idx) => idx + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-blue-500 text-white'
                        : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(pagination.totalPages || 1, prev + 1),
                  )
                }
                disabled={currentPage === (pagination.totalPages || 1)}
                className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editingTemplate ? 'Chỉnh sửa cấu hình mẫu' : 'Tạo cấu hình mẫu'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Tên cấu hình *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Mục đích sử dụng
                  </label>
                  <input
                    type="text"
                    name="usageType"
                    value={formData.usageType}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Gaming, Văn phòng..."
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mô tả ngắn gọn về cấu hình này"
                />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Cấu hình linh kiện
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.keys(EMPTY_COMPONENTS).map((key) => {
                    const currentId = formData.components[key];
                    const currentName = componentNames[currentId] || currentId;
                    const currentPrice = componentPrices[currentId];
                    const constraints = getConstraints(key);

                    return (
                      <ComponentSelect
                        key={key}
                        label={key}
                        categorySlug={COMPONENT_CATEGORIES[key]}
                        value={currentId}
                        displayValue={currentName}
                        selectedPrice={currentPrice}
                        onSelect={(product) => handleComponentSelect(key, product)}
                        constraints={constraints}
                      />
                    );
                  })}
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg flex justify-between items-center border border-blue-100">
                  <span className="font-bold text-gray-700">Tổng giá dự kiến:</span>
                  <span className="text-xl font-bold text-blue-600">
                    {Object.values(formData.components)
                      .reduce((sum, id) => sum + (componentPrices[id] || 0), 0)
                      .toLocaleString()}{' '}
                    ₫
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Bạn có thể copy ID sản phẩm từ trang quản lý sản phẩm.
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, isPublic: e.target.checked }))
                  }
                  className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
                  Công khai cấu hình này cho tất cả nhân viên
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
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
                  {loading ? 'Đang lưu...' : editingTemplate ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            {detailLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : selectedTemplate ? (
              <>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{selectedTemplate.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">Chi tiết cấu hình mẫu</p>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                  {/* General Info */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">Mục đích</p>
                        <p className="text-gray-800 font-medium">
                          {selectedTemplate.usageType || 'Chưa đặt'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">Tạo bởi</p>
                        <p className="text-gray-800 font-medium">
                          {selectedTemplate.createdBy?.fullName ||
                            selectedTemplate.createdBy?.userName ||
                            'Không rõ'}
                        </p>
                      </div>
                      {selectedTemplate.description && (
                        <div className="md:col-span-2">
                          <p className="text-xs text-gray-500 font-semibold uppercase">Mô tả</p>
                          <p className="text-gray-800">{selectedTemplate.description}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Components List */}
                  <div>
                    <h3 className="text-base font-bold text-gray-800 mb-3">Danh sách linh kiện</h3>
                    <div className="space-y-2">
                      {Object.keys(EMPTY_COMPONENTS).map((key) => {
                        const product = selectedTemplate.components?.[key];
                        return (
                          <div
                            key={key}
                            className="flex items-center gap-3 p-3 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
                          >
                            <div className="w-12 h-12 bg-gray-100 rounded-md border flex items-center justify-center p-1 flex-shrink-0">
                              {product?.images?.[0] ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="max-w-full max-h-full object-contain"
                                />
                              ) : (
                                <span className="text-xs font-bold text-gray-400">
                                  {key.toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className="text-sm font-bold text-gray-800 truncate"
                                title={product?.name}
                              >
                                {product ? product.name : `Chưa chọn ${key.toUpperCase()}`}
                              </p>
                              <p className="text-xs text-gray-500">{key.toUpperCase()}</p>
                            </div>
                            {product && (
                              <div className="text-right">
                                <p className="text-sm font-bold text-blue-600">
                                  {product.price?.toLocaleString()} ₫
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Total Price */}
                  <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                    <h3 className="text-base font-bold text-gray-800">Tổng giá dự kiến</h3>
                    <p className="text-2xl font-black text-blue-600">
                      {selectedTemplate.currentTotalPrice?.toLocaleString() || 0} ₫
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-6 py-2.5 bg-gray-100 text-gray-800 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
