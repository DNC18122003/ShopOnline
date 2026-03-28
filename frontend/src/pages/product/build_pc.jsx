import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Monitor, HardDrive, Layout, Zap, Thermometer, Box, Trash2, X, Plus, Search, SlidersHorizontal, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { getProducts } from '@/services/product/product.api';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/authContext';

const COMPONENT_GROUPS = [
  { key: 'cpu', label: 'CPU', categorySlug: 'cpu', icon: <Cpu className="w-4 h-4" /> },
  { key: 'gpu', label: 'GPU', categorySlug: 'vga', icon: <Monitor className="w-4 h-4" /> },
  { key: 'ram', label: 'RAM', categorySlug: 'ram', icon: <Box className="w-4 h-4" /> },
  { key: 'storage', label: 'Ổ cứng', categorySlug: 'ssd', icon: <HardDrive className="w-4 h-4" /> },
  { key: 'mainboard', label: 'Mainboard', categorySlug: 'mainboard', icon: <Layout className="w-4 h-4" /> },
  { key: 'psu', label: 'PSU', categorySlug: 'psu', icon: <Zap className="w-4 h-4" /> },
  { key: 'cooling', label: 'Tản nhiệt', categorySlug: 'cooling', icon: <Thermometer className="w-4 h-4" /> },
  { key: 'case', label: 'Case', categorySlug: 'case', icon: <Box className="w-4 h-4" /> },
];

const formatVND = (amount) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount || 0);

const getSocketValue = (product) => {
  if (!product?.specifications) return '';
  const specs = product.specifications;
  const detail = specs.detail_json || {};

  return (
    specs.socket ||
    detail.Socket ||
    detail.socket ||
    detail['Loại Socket'] ||
    ''
  );
};

function ComponentPickerModal({
  isOpen,
  group,
  products,
  selectedItem,
  onClose,
  onSelect,
}) {
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState('default');
  const [priceFilter, setPriceFilter] = useState('all');
  const [socketFilter, setSocketFilter] = useState('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    if (!isOpen) return;
    setSearch('');
    setSortOption('default');
    setPriceFilter('all');
    setSocketFilter('all');
    setPage(1);
  }, [isOpen, group?.key]);

  const socketOptions = ['cpu', 'mainboard'].includes(group?.key)
    ? Array.from(
        new Set(
          products
            .map((product) => getSocketValue(product))
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b, 'vi'))
    : [];

  if (!isOpen || !group) return null;

  const filtered = products.filter((product) => {
    const keyword = search.trim().toLowerCase();
    const name = (product?.name || '').toLowerCase();
    const specText = Object.values(product?.specifications || {})
      .map((v) => (typeof v === 'string' || typeof v === 'number' ? String(v).toLowerCase() : ''))
      .join(' ');

    const matchKeyword = !keyword || name.includes(keyword) || specText.includes(keyword);

    const price = product?.price || 0;
    const matchPrice =
      priceFilter === 'all' ||
      (priceFilter === 'lt1' && price < 1_000_000) ||
      (priceFilter === '1to3' && price >= 1_000_000 && price < 3_000_000) ||
      (priceFilter === '3to5' && price >= 3_000_000 && price < 5_000_000) ||
      (priceFilter === '5to10' && price >= 5_000_000 && price < 10_000_000) ||
      (priceFilter === 'gt10' && price >= 10_000_000);

    const socket = getSocketValue(product);
    const matchSocket =
      !['cpu', 'mainboard'].includes(group.key) ||
      socketFilter === 'all' ||
      socket === socketFilter;

    return matchKeyword && matchPrice && matchSocket;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortOption === 'price_asc') return (a?.price || 0) - (b?.price || 0);
    if (sortOption === 'price_desc') return (b?.price || 0) - (a?.price || 0);
    if (sortOption === 'name_asc') return (a?.name || '').localeCompare(b?.name || '', 'vi');
    if (sortOption === 'name_desc') return (b?.name || '').localeCompare(a?.name || '', 'vi');
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / itemsPerPage));
  const safePage = Math.min(page, totalPages);
  const visible = sorted.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm p-3 sm:p-6">
      <div className="h-full bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-2xl flex flex-col">
        <div className="bg-blue-900 text-white px-4 py-3 flex items-center justify-between">
          <h3 className="font-bold text-xl">Chọn linh kiện - {group.label}</h3>
          <button onClick={onClose} className="w-9 h-9 rounded-full border border-blue-300 hover:bg-blue-800 flex items-center justify-center">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr] min-h-0">
          <aside className="border-r border-gray-200 p-4 space-y-6 overflow-y-auto custom-scrollbar">
            <div>
              <h4 className="font-bold text-gray-800 mb-2">Lọc theo giá</h4>
              <div className="space-y-2 text-sm">
                {[
                  ['all', 'Tất cả'],
                  ['lt1', 'Dưới 1 triệu'],
                  ['1to3', '1 - 3 triệu'],
                  ['3to5', '3 - 5 triệu'],
                  ['5to10', '5 - 10 triệu'],
                  ['gt10', 'Trên 10 triệu'],
                ].map(([value, label]) => (
                  <label key={value} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="price-filter" checked={priceFilter === value} onChange={() => { setPriceFilter(value); setPage(1); }} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {['cpu', 'mainboard'].includes(group.key) && (
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Lọc theo socket</h4>
                <div className="space-y-2 text-sm max-h-56 overflow-y-auto custom-scrollbar pr-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="socket-filter"
                      checked={socketFilter === 'all'}
                      onChange={() => { setSocketFilter('all'); setPage(1); }}
                    />
                    <span>Tất cả</span>
                  </label>

                  {socketOptions.map((socket) => (
                    <label key={socket} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="socket-filter"
                        checked={socketFilter === socket}
                        onChange={() => { setSocketFilter(socket); setPage(1); }}
                      />
                      <span>{socket}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </aside>

          <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
              <div className="flex items-center flex-1 gap-2 border border-gray-200 rounded-xl px-3 py-2">
                <Search size={18} className="text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full outline-none text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-gray-500" />
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                >
                  <option value="default">Mặc định</option>
                  <option value="price_asc">Giá: thấp đến cao</option>
                  <option value="price_desc">Giá: cao đến thấp</option>
                  <option value="name_asc">Tên: A → Z</option>
                  <option value="name_desc">Tên: Z → A</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-700">Tìm thấy <span className="font-bold">{sorted.length}</span> sản phẩm</p>
              {sorted.length > itemsPerPage && (
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} className="p-1 rounded border border-gray-200 disabled:opacity-40">
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm font-medium">{safePage}/{totalPages}</span>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="p-1 rounded border border-gray-200 disabled:opacity-40">
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {visible.length > 0 ? visible.map((product) => {
                const isSelected = Array.isArray(selectedItem)
                  ? selectedItem.some((item) => item?._id === product._id)
                  : selectedItem?._id === product._id;

                const handleChooseProduct = () => {
                  onSelect(product);
                  if (!['ram', 'storage'].includes(group.key)) {
                    onClose();
                  }
                };

                return (
                <div
                  key={product._id}
                  onClick={handleChooseProduct}
                  className="border border-gray-200 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:border-blue-300 hover:bg-blue-50/40 transition-colors"
                >
                  <div className="w-16 h-16 bg-gray-50 rounded-lg p-1 flex items-center justify-center shrink-0">
                    <img src={product.images?.[0] || 'https://via.placeholder.com/80'} alt={product.name} className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 line-clamp-2">{product.name}</p>
                    <p className="text-red-600 font-bold mt-1">{formatVND(product.price)}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChooseProduct();
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-bold ${isSelected ? 'bg-green-100 text-green-700' : 'bg-blue-800 text-white hover:bg-blue-700'}`}
                  >
                    {isSelected ? 'Đã chọn' : 'Thêm'}
                  </button>
                </div>
                );
              }) : (
                <div className="py-12 text-center text-gray-500">Không có sản phẩm phù hợp.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SaveConfigModal({ isOpen, onClose, onSave }) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(`Cấu hình ${new Date().toLocaleDateString('vi-VN')}`);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (name.trim()) {
      onSave(name);
      onClose();
    } else {
      toast.warning('Vui lòng nhập tên cho cấu hình');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-bold text-lg text-gray-900">Lưu cấu hình</h3>
        </div>
        <div className="p-6 space-y-4">
          <label htmlFor="config-name" className="text-sm font-medium text-gray-700">Tên cấu hình</label>
          <input
            id="config-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: Cấu hình chơi game"
          />
        </div>
        <div className="p-6 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
            <button
                onClick={onClose}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg transition-colors"
            >
                Hủy
            </button>
            <button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
                Lưu
            </button>
        </div>
      </div>
    </div>
  );
}

function LoadConfigModal({ isOpen, onClose, configs, onLoad, onDelete }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-900">Tải cấu hình đã lưu</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {configs.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Không có cấu hình nào được lưu.</p>
          ) : (
            <div className="space-y-3">
              {configs.map((config) => (
                <div key={config.id} className="border border-gray-100 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50/50 transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-800">{config.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Lưu lúc: {new Date(config.savedAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => onLoad(config)}
                        className="text-sm font-semibold text-blue-600 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-md"
                      >
                        Tải
                      </button>
                      <button
                        onClick={() => onDelete(config.id)}
                        className="text-red-500 bg-red-50 hover:bg-red-100 p-2 rounded-md"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-6 bg-gray-50 rounded-b-2xl text-right">
            <button
                onClick={onClose}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg transition-colors"
            >
                Đóng
            </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmClearModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-bold text-lg text-gray-900">Xác nhận xóa tất cả</h3>
        </div>
        <div className="p-6 text-sm text-gray-600">
          Bạn có chắc muốn xóa toàn bộ linh kiện đã chọn không?
        </div>
        <div className="p-6 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Xóa tất cả
          </button>
        </div>
      </div>
    </div>
  );
}

function RightSummary({ selectedItems, onLoadConfig, onSaveConfig, onClearAll }) {
  const navigate = useNavigate();

  const subtotal = useMemo(() => {
    return Object.values(selectedItems).reduce((sum, item) => {
      if (Array.isArray(item)) {
        return sum + item.reduce((arrSum, product) => arrSum + (product?.price || 0), 0);
      }
      return sum + (item?.price || 0);
    }, 0);
  }, [selectedItems]);

  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  const handleCheckout = () => {
    const selectedCount = Object.values(selectedItems).reduce((count, item) => {
      if (Array.isArray(item)) return count + item.length;
      return count + (item ? 1 : 0);
    }, 0);

    if (selectedCount === 0) {
      toast.warning('Vui lòng chọn ít nhất một linh kiện để thanh toán');
      return;
    }

    const items = Object.entries(selectedItems).flatMap(([key, product]) => {
      if (Array.isArray(product)) {
        return product.map((p) => ({
          productId: p._id,
          nameSnapshot: p.name,
          priceSnapshot: p.price,
          imageSnapshot: p.images?.[0] || '',
          quantity: 1,
          category: key,
        }));
      }

      if (!product) return [];

      return [{
        productId: product._id,
        nameSnapshot: product.name,
        priceSnapshot: product.price,
        imageSnapshot: product.images?.[0] || '',
        quantity: 1,
        category: key,
      }];
    });

    const buildPcData = {
      items,
      totalPrice: subtotal,
      isBuildPc: true,
    };

    localStorage.setItem('buildpc_checkout', JSON.stringify(buildPcData));
    navigate('/checkout');
  };

  return (
    <div className="space-y-4 sticky top-6">
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 text-base">Tổng chi phí</h2>
          <button
            onClick={onLoadConfig}
            className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            Tải đã lưu
          </button>
        </div>

        <div className="space-y-2 border-t border-gray-100 pt-4">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Tổng phụ:</span>
            <span className="font-medium">{formatVND(subtotal)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Thuế (10%):</span>
            <span className="font-medium">{formatVND(tax)}</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="font-bold text-gray-900">Tổng cộng:</span>
            <span className="text-xl font-black text-blue-600">{formatVND(total)}</span>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <button
            onClick={handleCheckout}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-200 text-sm"
          >
            Thanh toán ngay
          </button>
          <button
            onClick={onSaveConfig}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 rounded-xl transition-all text-sm"
          >
            Lưu cấu hình
          </button>
          <button
            onClick={onClearAll}
            className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-xl transition-all text-sm"
          >
            Xóa tất cả
          </button>
        </div>
      </div>
    </div>
  );
}
export default function BuildPcPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState({});
  const [pickerGroupKey, setPickerGroupKey] = useState(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [savedConfigs, setSavedConfigs] = useState([]);

  const getBuildPcStorageKey = useCallback(() => {
    const userId = user?._id || user?.id;
    return userId ? `buildpc_configs_${userId}` : 'buildpc_configs_guest';
  }, [user]);

  const getBuildPcSelectionKey = useCallback(() => {
    const userId = user?._id || user?.id;
    return userId ? `buildpc_selected_${userId}` : 'buildpc_selected_guest';
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    const storageKey = getBuildPcStorageKey();
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (Array.isArray(parsed)) {
          setSavedConfigs(parsed);
        }
      } catch (e) {
        console.error('Load saved configs error:', e);
        setSavedConfigs([]);
      }
    } else {
      setSavedConfigs([]);
    }
  }, [user, authLoading, getBuildPcStorageKey]);

  useEffect(() => {
    if (authLoading) return;
    const selectionKey = getBuildPcSelectionKey();
    const savedSelection = localStorage.getItem(selectionKey);
    if (savedSelection) {
      try {
        const parsed = JSON.parse(savedSelection);
        if (parsed && typeof parsed === 'object') {
          setSelectedItems(parsed);
        }
      } catch (e) {
        console.error('Load selected items error:', e);
      }
    }
  }, [user, authLoading, getBuildPcSelectionKey]);

  const handleSaveConfig = () => {
    if (!user) {
      toast.info('Vui lòng đăng nhập để lưu cấu hình');
      navigate('/login', { state: { from: '/build-pc' } });
      return;
    }

    const selectedCount = Object.keys(selectedItems).length;
    if (selectedCount === 0) {
      toast.warning('Chưa có linh kiện nào để lưu');
      return;
    }
    
    setIsSaveModalOpen(true);
  };

  const executeSaveConfig = (configName) => {
    try {
      const storageKey = getBuildPcStorageKey();
      const newConfig = {
        id: Date.now().toString(),
        name: configName,
        selectedItems,
        savedAt: new Date().toISOString(),
      };
      
      const updatedConfigs = [...savedConfigs, newConfig];
      localStorage.setItem(storageKey, JSON.stringify(updatedConfigs));
      setSavedConfigs(updatedConfigs);
      toast.success(`Đã lưu cấu hình "${configName}"`);
    } catch (e) {
      console.error('Save build pc config error:', e);
      toast.error('Lưu cấu hình thất bại');
    }
  };

  const handleOpenLoadModal = () => {
    setIsLoadModalOpen(true);
  };

  const handleLoadConfig = (config) => {
    if (config.selectedItems) {
      setSelectedItems(config.selectedItems);
      toast.success(`Đã tải cấu hình "${config.name}"`);
      setIsLoadModalOpen(false);
    }
  };

  const handleDeleteConfig = (configId) => {
    if (!window.confirm('Bạn có chắc muốn xóa cấu hình này?')) return;

    const newConfigs = savedConfigs.filter(c => c.id !== configId);
    const storageKey = getBuildPcStorageKey();
    localStorage.setItem(storageKey, JSON.stringify(newConfigs));
    setSavedConfigs(newConfigs);
    toast.success('Đã xóa cấu hình');
  };

  // Hàm lấy socket/ram_type từ specifications hoặc detail_json (tương tự backend logic)
  const getSpec = useCallback((product, key) => {
    if (!product?.specifications) return null;
    if (product.specifications[key]) return product.specifications[key];
    const detail = product.specifications.detail_json || {};
    const aliases = {
      socket: ["Socket", "socket", "Loại Socket"],
      ram_type: ["Hỗ trợ RAM", "Loại RAM", "ram_type", "RAM"],
      form_factor: ["Kích thước mainboard", "Chuẩn mainboard", "form_factor"]
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

  const normalizeToArray = useCallback((value) => {
    if (Array.isArray(value)) return value.filter(Boolean);
    return value ? [value] : [];
  }, []);


  const getConstraintsByCategory = useCallback((categoryKey) => {
    const constraints = {};

    if (categoryKey === 'mainboard') {
      const cpuSocket = getSpec(selectedItems.cpu, 'socket');
      if (cpuSocket) constraints.socket = cpuSocket;
    } else if (categoryKey === 'ram') {
      const mainRamType = getSpec(selectedItems.mainboard, 'ram_type');
      if (mainRamType) constraints.ram_type = mainRamType;
      else {
        const cpuRamType = getSpec(selectedItems.cpu, 'ram_type');
        if (cpuRamType) constraints.ram_type = cpuRamType;
      }
    } else if (categoryKey === 'case') {
      const mainForm = getSpec(selectedItems.mainboard, 'form_factor');
      if (mainForm) constraints.form_factor = mainForm;
    } else if (categoryKey === 'cpu' && selectedItems.mainboard) {
      const mainSocket = getSpec(selectedItems.mainboard, 'socket');
      if (mainSocket) constraints.socket = mainSocket;
    } else if (categoryKey === 'psu') {
      const totalWattage = Object.values(selectedItems)
        .reduce((sum, item) => {
          if (Array.isArray(item)) {
            return sum + item.reduce((arrSum, product) => arrSum + getWattage(product), 0);
          }
          return sum + getWattage(item);
        }, 0);

      if (totalWattage > 0) {
        const recommendedWattage = Math.ceil((totalWattage * 1.3) / 50) * 50;
        constraints.min_wattage = recommendedWattage;
      }
    }

    return constraints;
  }, [selectedItems, getSpec, getWattage]);

  useEffect(() => {
    const buildParamsByGroup = (group, constraints) => {
      // Backend productType map theo model chuyên biệt
      const productTypeMap = {
        cpu: 'cpu',
        gpu: 'gpu',
        ram: 'ram',
        mainboard: 'mainboard',
      };

      // category slug aliases để chịu lỗi data slug không đồng nhất
      const categoryAliasMap = {
        cooling: ['cooling', 'cooler', 'tan-nhiet'],
      };

      const params = {
        limit: 50,
        ...constraints,
      };

      if (productTypeMap[group.key]) {
        params.productType = productTypeMap[group.key];
      } else if (categoryAliasMap[group.key]) {
        params.category = categoryAliasMap[group.key].join(',');
      } else {
        params.category = group.categorySlug;
      }

      return params;
    };

    const fetchAllCategories = async () => {
      setLoading(true);
      try {
        const entries = await Promise.all(
          COMPONENT_GROUPS.map(async (group) => {
            try {
              const constraints = getConstraintsByCategory(group.key);
              const res = await getProducts(buildParamsByGroup(group, constraints));
              return [group.key, res?.data || []];
            } catch (err) {
              console.error(`Fetch ${group.key} error:`, err);
              return [group.key, []];
            }
          })
        );

        setAllProducts(Object.fromEntries(entries));
      } finally {
        setLoading(false);
      }
    };

    fetchAllCategories();
  }, [getConstraintsByCategory]);

  const handleSelect = (categoryKey, product) => {
    setSelectedItems((prev) => {
      if (['ram', 'storage'].includes(categoryKey)) {
        const current = normalizeToArray(prev[categoryKey]);
        return { ...prev, [categoryKey]: [...current, product] };
      }

      return { ...prev, [categoryKey]: product };
    });
  };

  useEffect(() => {
    if (authLoading) return;
    const selectionKey = getBuildPcSelectionKey();
    if (Object.keys(selectedItems).length > 0) {
      localStorage.setItem(selectionKey, JSON.stringify(selectedItems));
    } else {
      localStorage.removeItem(selectionKey);
    }
  }, [selectedItems, authLoading, getBuildPcSelectionKey]);

  const handleRemove = (key, index = null) => {
    setSelectedItems((prev) => {
      const next = { ...prev };

      if (index !== null && ['ram', 'storage'].includes(key) && Array.isArray(next[key])) {
        const updated = next[key].filter((_, idx) => idx !== index);
        if (updated.length > 0) {
          next[key] = updated;
        } else {
          delete next[key];
        }
        return next;
      }

      delete next[key];
      return next;
    });
  };

  const handleClearAll = () => {
    setIsClearAllModalOpen(true);
  };

  const executeClearAll = () => {
    setSelectedItems({});
    const selectionKey = getBuildPcSelectionKey();
    localStorage.removeItem(selectionKey);
    setIsClearAllModalOpen(false);
    toast.success('Đã xóa toàn bộ linh kiện đã chọn');
  };

  const pickerGroup = COMPONENT_GROUPS.find((g) => g.key === pickerGroupKey) || null;
  const pickerProducts = pickerGroup ? (allProducts[pickerGroup.key] || []) : [];

  const openPicker = (groupKey) => {
    setPickerGroupKey(groupKey);
    setIsPickerOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-8">
          <main className="flex-1">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h1 className="text-2xl font-bold text-gray-900">Danh sách linh kiện</h1>
                <p className="text-sm text-gray-500 mt-1">Nhấn nút chọn để mở modal chọn linh kiện cho từng nhóm</p>
              </div>

              {loading ? (
                <div className="p-5 space-y-3 animate-pulse">
                  {COMPONENT_GROUPS.map((group) => (
                    <div key={group.key} className="h-16 bg-gray-100 rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {COMPONENT_GROUPS.map((group, index) => {
                    const item = selectedItems[group.key];
                    const itemsArray = normalizeToArray(item);
                    const isMulti = ['ram', 'storage'].includes(group.key);

                    return (
                      <div key={group.key} className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-3 p-4 items-center bg-gray-50/40 odd:bg-white">
                        <div className="font-bold text-gray-800 flex items-center gap-2">
                          <span>{index + 1}.</span>
                          {group.icon}
                          <span>{group.label}</span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
                          {(!item || (isMulti && itemsArray.length === 0)) && (
                            <button
                              onClick={() => openPicker(group.key)}
                              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg px-4 py-2 w-fit"
                            >
                              <Plus size={16} />
                              {`Chọn ${group.label}`}
                            </button>
                          )}

                          {item && (
                            <div className="flex flex-col gap-3 min-w-0 flex-1">
                              {isMulti ? (
                                itemsArray.map((selectedProduct, selectedIndex) => (
                                  <div key={`${selectedProduct._id}-${selectedIndex}`} className="flex items-center gap-2 min-w-0">
                                    <img
                                      src={selectedProduct.images?.[0] || 'https://via.placeholder.com/50'}
                                      alt={selectedProduct.name}
                                      className="w-12 h-12 rounded border border-gray-200 object-contain bg-white"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-semibold text-gray-800 truncate">{selectedProduct.name}</p>
                                      <p className="text-xs font-bold text-red-600">{formatVND(selectedProduct.price)}</p>
                                    </div>

                                    <button
                                      onClick={() => openPicker(group.key)}
                                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                      title="Thêm linh kiện"
                                    >
                                      <Pencil size={15} />
                                    </button>
                                    <button
                                      onClick={() => handleRemove(group.key, selectedIndex)}
                                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                                      title="Xóa linh kiện"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  </div>
                                ))
                              ) : (
                                <div className="flex items-center gap-2 min-w-0">
                                  <img
                                    src={item.images?.[0] || 'https://via.placeholder.com/50'}
                                    alt={item.name}
                                    className="w-12 h-12 rounded border border-gray-200 object-contain bg-white"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                                    <p className="text-xs font-bold text-red-600">{formatVND(item.price)}</p>
                                  </div>

                                  <button
                                    onClick={() => openPicker(group.key)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                    title="Đổi linh kiện"
                                  >
                                    <Pencil size={15} />
                                  </button>
                                  <button
                                    onClick={() => handleRemove(group.key)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                                    title="Xóa linh kiện"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </main>

          <aside className="lg:w-80 flex-shrink-0">
            <RightSummary 
              selectedItems={selectedItems}
              onLoadConfig={handleOpenLoadModal}
              onSaveConfig={handleSaveConfig}
              onClearAll={handleClearAll}
            />
          </aside>

        </div>
      </div>
      
      <ComponentPickerModal
        isOpen={isPickerOpen}
        group={pickerGroup}
        products={pickerProducts}
        selectedItem={pickerGroup ? selectedItems[pickerGroup.key] : null}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(product) => {
          if (pickerGroup) {
            handleSelect(pickerGroup.key, product);
          }
        }}
      />

      <SaveConfigModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={executeSaveConfig}
      />

      <LoadConfigModal 
        isOpen={isLoadModalOpen}
        onClose={() => setIsLoadModalOpen(false)}
        configs={savedConfigs}
        onLoad={handleLoadConfig}
        onDelete={handleDeleteConfig}
      />

      <ConfirmClearModal
        isOpen={isClearAllModalOpen}
        onClose={() => setIsClearAllModalOpen(false)}
        onConfirm={executeClearAll}
      />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        .backdrop-blur-sm {
          backdrop-filter: blur(4px);
        }
      `}</style>
    </div>
  );
}
