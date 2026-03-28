  import { useEffect, useState, useCallback } from 'react';
  import { Search, Plus, Edit2, Trash2, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react';
  import { toast } from 'react-toastify';
  import {
    getBuildPcTemplates,
    createBuildPcTemplate,
    updateBuildPcTemplate,
    deleteBuildPcTemplate,
  } from '@/services/buildPcTemplate.api';
import { getProducts } from '@/services/product/product.api';

  const EMPTY_COMPONENTS = {
    cpu: '',
    main: '',
    ram: [],
    gpu: '',
    ssd: [],
    hdd: '',
    psu: '',
    case: '',
  };

  export function BuildPcTemplateManagement() {
    const [templates, setTemplates] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
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

    const [componentOptions, setComponentOptions] = useState({
      cpu: [],
      main: [],
      ram: [],
      gpu: [],
      ssd: [],
      hdd: [],
      psu: [],
      case: [],
    });
    const [loadingComponents, setLoadingComponents] = useState(false);

    const getSpec = useCallback((product, key) => {
      if (!product?.specifications) return null;
      if (product.specifications[key]) return product.specifications[key];
      const detail = product.specifications.detail_json || {};
      const aliases = {
        socket: ['Socket', 'socket', 'Loại Socket'],
        ram_type: ['Hỗ trợ RAM', 'Loại RAM', 'ram_type', 'RAM'],
        form_factor: ['Kích thước mainboard', 'Chuẩn mainboard', 'form_factor'],
      };
      const keys = aliases[key] || [key];
      for (const k of keys) {
        if (detail[k]) return detail[k];
      }
      return null;
    }, []);

    const getWattage = useCallback((product) => {
      if (!product?.specifications) return 0;
      const wattage = product.specifications.wattage || product.specifications.power;
      if (typeof wattage === 'number') return wattage;
      if (typeof wattage === 'string') {
        const parsed = parseInt(String(wattage).replace(/W/i, '').trim(), 10);
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    }, []);

    const [formData, setFormData] = useState({
      name: '',
      description: '',
      usageType: '',
      isPublic: true,
      components: { ...EMPTY_COMPONENTS },
    });
    const [multiSearch, setMultiSearch] = useState({ ram: '', ssd: '' });
    const [multiDropdownOpen, setMultiDropdownOpen] = useState({ ram: false, ssd: false });
    const [multiScrollTop, setMultiScrollTop] = useState({ ram: 0, ssd: 0 });

    const resetForm = () => {
      setFormData({
        name: '',
        description: '',
        usageType: '',
        isPublic: true,
        components: { ...EMPTY_COMPONENTS },
      });
      setMultiSearch({ ram: '', ssd: '' });
      setMultiDropdownOpen({ ram: false, ssd: false });
      setMultiScrollTop({ ram: 0, ssd: 0 });
      setEditingTemplate(null);
    };

    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const params = {
          page: currentPage,
          limit: 10,
          keyword: searchTerm,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
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

    const fetchComponentOptions = async () => {
      try {
        setLoadingComponents(true);
        const mapCategory = {
          cpu: 'cpu',
          main: 'mainboard',
          ram: 'ram',
          gpu: 'vga',
          ssd: 'ssd',
          hdd: 'hdd',
          psu: 'psu',
          case: 'case',
        };

        const entries = await Promise.all(
          Object.entries(mapCategory).map(async ([key, category]) => {
            const res = await getProducts({ category, limit: 100 });
            return [key, res?.data || []];
          }),
        );

        const nextOptions = entries.reduce((acc, [key, items]) => {
          acc[key] = items;
          return acc;
        }, {});

        setComponentOptions((prev) => ({
          ...prev,
          ...nextOptions,
        }));
      } catch (error) {
        console.error('Error fetching component options:', error);
        toast.error('Không thể tải danh sách linh kiện');
      } finally {
        setLoadingComponents(false);
      }
    };

    useEffect(() => {
      fetchTemplates();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, searchTerm, minPrice, maxPrice]);

    useEffect(() => {
      fetchComponentOptions();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openCreateModal = () => {
      resetForm();
      setShowModal(true);
    };

    const openEditModal = (template) => {
      const normalizeMultiIds = (value) => {
        if (!value) return [];
        if (Array.isArray(value)) {
          return value
            .map((v) => {
              if (typeof v === 'string') return v;
              if (typeof v === 'object') return v?._id || v?.productId || v?.id || null;
              return null;
            })
            .filter(Boolean);
        }
        if (typeof value === 'object') return [value?._id || value?.productId || value?.id].filter(Boolean);
        return [value];
      };

      setEditingTemplate(template);
      setFormData({
        name: template.name,
        description: template.description || '',
        usageType: template.usageType || '',
        isPublic: template.isPublic,
        components: {
          ...EMPTY_COMPONENTS,
          ...(template.components || {}),
          ram: normalizeMultiIds(template.components?.ram),
          ssd: normalizeMultiIds(template.components?.ssd),
        },
      });
      setShowModal(true);
    };

    const openDetailModal = (template) => {
      setSelectedTemplate(template);
      setShowDetailModal(true);
    };

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    const handleComponentChange = (key, value) => {
      setFormData((prev) => ({
        ...prev,
        components: {
          ...prev.components,
          [key]: value,
        },
      }));
    };

    const handleMultiComponentQuantityChange = (key, value, delta) => {
      setFormData((prev) => {
        const current = Array.isArray(prev.components[key]) ? [...prev.components[key]] : [];
        if (delta > 0) {
          current.push(value);
        } else {
          const index = current.findIndex((id) => id === value);
          if (index !== -1) current.splice(index, 1);
        }

        return {
          ...prev,
          components: {
            ...prev.components,
            [key]: current,
          },
        };
      });
    };

    const selectedProducts = Object.entries(formData.components).reduce((acc, [key, value]) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return acc;

      if (Array.isArray(value)) {
        const firstMatched = (componentOptions[key] || []).find((item) => value.includes(item._id));
        if (firstMatched) {
          acc[key] = firstMatched;
        }
        return acc;
      }

      const product = (componentOptions[key] || []).find((item) => item._id === value);
      if (product) acc[key] = product;
      return acc;
    }, {});

    const isOptionCompatible = useCallback((key, candidate, currentSelected) => {
      const next = {
        ...currentSelected,
        [key]: candidate,
      };

      const cpu = next.cpu;
      const main = next.main;
      const ram = Array.isArray(next.ram) ? next.ram[0] : next.ram;
      const pcCase = next.case;
      const psu = next.psu;

      // 1) CPU <-> Mainboard (2 chiều)
      if (cpu && main) {
        const cpuSocket = getSpec(cpu, 'socket');
        const mainSocket = getSpec(main, 'socket');
        if (cpuSocket && mainSocket && cpuSocket !== mainSocket) return false;
      }

      // 2) RAM <-> Mainboard (2 chiều)
      if (ram && main) {
        const ramType = getSpec(ram, 'ram_type');
        const mainRamType = getSpec(main, 'ram_type');
        if (ramType && mainRamType && ramType !== mainRamType) return false;
      }

      // 3) Case <-> Mainboard (2 chiều)
      if (pcCase && main) {
        const caseFormFactor = getSpec(pcCase, 'form_factor');
        const mainFormFactor = getSpec(main, 'form_factor');
        if (caseFormFactor && mainFormFactor && caseFormFactor !== mainFormFactor) return false;
      }

      // 4) PSU đủ công suất với các part hiện tại
      if (psu) {
        const parts = [next.cpu, next.gpu, next.main, next.ram, next.ssd, next.hdd, next.case].filter(Boolean);
        const estimated = parts.reduce((sum, product) => sum + getWattage(product), 0);
        const required = Math.ceil((estimated * 1.3) / 50) * 50;
        const psuWatt = getWattage(psu);
        if (required > 0 && psuWatt > 0 && psuWatt < required) return false;
      }

      return true;
    }, [getSpec, getWattage]);

    const getFilteredOptions = useCallback((key) => {
      const options = componentOptions[key] || [];
      const currentValue = formData.components[key];
      const currentIds = Array.isArray(currentValue) ? currentValue : [currentValue];

      return options.filter((item) => {
        if (currentIds.includes(item._id)) return true;
        return isOptionCompatible(key, item, selectedProducts);
      });
    }, [componentOptions, formData.components, isOptionCompatible, selectedProducts]);

    const getMultiComponentView = useCallback((key) => {
      const filtered = getFilteredOptions(key);
      const keyword = (multiSearch[key] || '').trim().toLowerCase();
      const selectedIds = Array.isArray(formData.components[key]) ? formData.components[key] : [];

      const selectedCountMap = selectedIds.reduce((acc, id) => {
        acc[id] = (acc[id] || 0) + 1;
        return acc;
      }, {});

      const searched = filtered.filter((item) => {
        if (!keyword) return true;
        return (item.name || '').toLowerCase().includes(keyword);
      });

      const sorted = [...searched].sort((a, b) => {
        const aQty = selectedCountMap[a._id] || 0;
        const bQty = selectedCountMap[b._id] || 0;
        if (aQty !== bQty) return bQty - aQty;
        return (a.name || '').localeCompare(b.name || '', 'vi');
      });

      const rowHeight = 44;
      const viewportHeight = 220;
      const overscan = 3;
      const totalCount = sorted.length;
      const start = Math.max(0, Math.floor((multiScrollTop[key] || 0) / rowHeight) - overscan);
      const visibleCount = Math.ceil(viewportHeight / rowHeight) + overscan * 2;
      const end = Math.min(totalCount, start + visibleCount);

      return {
        selectedCountMap,
        sorted,
        rowHeight,
        viewportHeight,
        totalCount,
        start,
        end,
      };
    }, [formData.components, getFilteredOptions, multiScrollTop, multiSearch]);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!formData.name.trim()) {
        toast.error('Vui lòng nhập tên cấu hình mẫu');
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
          {/* Search + Filters + Add */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
              {/* Search by name */}
              <div className="relative flex-1 w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm theo tên..."
                  value={searchTerm}
                  onChange={(e) => {
                    setCurrentPage(1);
                    setSearchTerm(e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {/* Filter by price */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="number"
                  placeholder="Giá từ"
                  value={minPrice}
                  onChange={(e) => {
                    setCurrentPage(1);
                    setMinPrice(e.target.value);
                  }}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Giá đến"
                  value={maxPrice}
                  onChange={(e) => {
                    setCurrentPage(1);
                    setMaxPrice(e.target.value);
                  }}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
            {/* Add button */}
            <div className="w-full md:w-auto flex-shrink-0">
              <button
                onClick={openCreateModal}
                className="w-full md:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
              >
                <Plus className="w-5 h-5" />
                <span>Tạo Cấu Hình Mới</span>
              </button>
            </div>
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
                      Tổng giá
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
                        <p className="text-sm font-semibold text-red-600">
                          {tpl.totalPrice ? `${tpl.totalPrice.toLocaleString('vi-VN')}₫` : 'N/A'}
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
          <div className="fixed inset-0 bg-black/20 bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
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
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Chọn linh kiện
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.keys(EMPTY_COMPONENTS).map((key) => (
                      <div key={key}>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          {key.toUpperCase()} {['ram', 'ssd'].includes(key) ? '(chọn nhiều)' : ''}
                        </label>
                        {['ram', 'ssd'].includes(key) ? (
                          <div className="relative">
                            <input
                              type="text"
                              value={multiSearch[key] || ''}
                              onChange={(e) => setMultiSearch((prev) => ({ ...prev, [key]: e.target.value }))}
                              onFocus={() => setMultiDropdownOpen((prev) => ({ ...prev, [key]: true }))}
                              placeholder={`Tìm ${key.toUpperCase()}...`}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />

                            {multiDropdownOpen[key] && (
                              <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                                {(() => {
                                  const view = getMultiComponentView(key);
                                  return (
                                    <>
                                      <div
                                        className="relative overflow-y-auto"
                                        style={{ height: `${view.viewportHeight}px` }}
                                        onScroll={(e) => {
                                          setMultiScrollTop((prev) => ({ ...prev, [key]: e.currentTarget.scrollTop }));
                                        }}
                                      >
                                        <div style={{ height: `${view.totalCount * view.rowHeight}px`, position: 'relative' }}>
                                          {view.sorted.slice(view.start, view.end).map((item, index) => {
                                            const realIndex = view.start + index;
                                            const quantity = view.selectedCountMap[item._id] || 0;
                                            return (
                                              <div
                                                key={item._id}
                                                className="absolute left-0 right-0 flex items-center justify-between gap-2 text-sm px-3 border-b border-gray-100"
                                                style={{
                                                  top: `${realIndex * view.rowHeight}px`,
                                                  height: `${view.rowHeight}px`,
                                                }}
                                              >
                                                <span className="text-gray-700 truncate pr-2">{item.name}</span>
                                                <div className="flex items-center gap-2 shrink-0">
                                                  <button
                                                    type="button"
                                                    onClick={() => handleMultiComponentQuantityChange(key, item._id, -1)}
                                                    disabled={loadingComponents || quantity === 0}
                                                    className="w-7 h-7 rounded border border-gray-300 text-gray-700 disabled:opacity-40"
                                                  >
                                                    -
                                                  </button>
                                                  <span className="w-6 text-center font-semibold text-gray-800">{quantity}</span>
                                                  <button
                                                    type="button"
                                                    onClick={() => handleMultiComponentQuantityChange(key, item._id, 1)}
                                                    disabled={loadingComponents}
                                                    className="w-7 h-7 rounded border border-gray-300 text-gray-700"
                                                  >
                                                    +
                                                  </button>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                      {!loadingComponents && view.totalCount === 0 && (
                                        <p className="text-xs text-gray-400 p-3">Không có linh kiện tương thích.</p>
                                      )}
                                      <div className="p-2 border-t border-gray-100 text-right">
                                        <button
                                          type="button"
                                          onClick={() => setMultiDropdownOpen((prev) => ({ ...prev, [key]: false }))}
                                          className="text-xs text-blue-600 hover:underline"
                                        >
                                          Đóng
                                        </button>
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        ) : (
                          <select
                            value={formData.components[key] || ''}
                            onChange={(e) => handleComponentChange(key, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            disabled={loadingComponents}
                          >
                            <option value="">
                              {loadingComponents ? 'Đang tải linh kiện...' : `Chọn ${key.toUpperCase()}`}
                            </option>
                            {getFilteredOptions(key).map((item) => (
                              <option key={item._id} value={item._id}>
                                {item.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    ))}
                  </div>
                 
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
        {showDetailModal && selectedTemplate && (
          <div className="fixed inset-0 bg-black/20 bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  Chi tiết cấu hình: {selectedTemplate.name}
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Mục đích:</span>{' '}
                  {selectedTemplate.usageType || 'Chưa đặt mục đích'}
                </p>
                {selectedTemplate.description && (
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Mô tả:</span> {selectedTemplate.description}
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  Tạo bởi:{' '}
                  {selectedTemplate.createdBy?.fullName ||
                    selectedTemplate.createdBy?.userName ||
                    'Không rõ'}
                </p>
                <div className="border-t border-gray-200 pt-3">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">Linh kiện</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {Object.entries(selectedTemplate.components || {}).map(([key, value]) => {
                      const matched = (componentOptions[key] || []).find((item) => item._id === value);
                      const label = matched?.name || value || 'Chưa chọn';
                      return (
                        <div key={key} className="flex justify-between border-b border-dashed py-1">
                          <span className="font-medium text-gray-700">{key.toUpperCase()}</span>
                          <span className="text-gray-600 truncate max-w-[60%] text-right">
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
