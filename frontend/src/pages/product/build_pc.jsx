import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, AlertCircle, Cpu, Monitor, HardDrive, Layout, Zap, Thermometer, Box, Trash2, Info } from 'lucide-react';
import { getProducts, checkBuildPcCompatibility } from '@/services/product/product.api';
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

function ProductCard({ product, onSelect, onRemove, isSelected }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="aspect-square mb-4 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center p-4">
        <img 
          src={product.images?.[0] || 'https://via.placeholder.com/200'} 
          alt={product.name}
          className="max-w-full max-h-full object-contain mix-blend-multiply"
        />
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2 min-h-[40px]">
          {product.name}
        </h3>
        {product.specifications && (
          <p className="text-[10px] text-gray-500 mb-2">
            {product.specifications.socket || product.specifications.ram_type || product.specifications.wattage || 'Sản phẩm chất lượng cao'}
          </p>
        )}
        <div className="flex items-center justify-between mb-4">
          <span className="text-blue-600 font-bold text-base">
            {formatVND(product.price)}
          </span>
          <div className="flex items-center gap-1 text-yellow-400">
            <span className="text-xs text-gray-500">★</span>
            <span className="text-xs font-medium text-gray-700">4.8</span>
          </div>
        </div>
      </div>
      {isSelected ? (
        <div className="flex gap-2">
          <button
            disabled
            className="flex-1 py-2 rounded-lg text-sm font-semibold bg-green-100 text-green-600 cursor-default flex items-center justify-center gap-1"
          >
            <Check size={14} /> Đã thêm
          </button>
          <button
            onClick={() => onRemove(product)}
            className="px-3 py-2 rounded-lg text-sm font-semibold bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex items-center justify-center"
            title="Bỏ chọn linh kiện này"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => onSelect(product)}
          className="w-full py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Thêm vào cấu hình
        </button>
      )}
    </div>
  );
}

function RightSummary({ selectedItems, onRemove, compatibilityResult, compatibilityLoading }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getBuildPcStorageKey = () => {
    const userId = user?._id || user?.id;
    return userId ? `buildpc_config_${userId}` : 'buildpc_config_guest';
  };

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

    try {
      const key = getBuildPcStorageKey();
      const payload = {
        selectedItems,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify(payload));
      toast.success('Đã lưu cấu hình theo tài khoản của bạn');
    } catch (e) {
      console.error('Save build pc config error:', e);
      toast.error('Lưu cấu hình thất bại');
    }
  };
  const subtotal = useMemo(() => {
    return Object.values(selectedItems).reduce((sum, item) => sum + (item?.price || 0), 0);
  }, [selectedItems]);

  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  const handleCheckout = () => {
    const selectedCount = Object.keys(selectedItems).length;
    if (selectedCount === 0) {
      toast.warning('Vui lòng chọn ít nhất một linh kiện để thanh toán');
      return;
    }

    if (!compatibilityResult?.isCompatible) {
      toast.info(`Cấu hình có vấn đề tương thích. Bạn vẫn có thể tiếp tục thanh toán.`);
    }

    // Chuyển đổi selectedItems sang định dạng line items cho Checkout
    const items = Object.entries(selectedItems).map(([key, product]) => ({
      productId: product._id,
      nameSnapshot: product.name,
      priceSnapshot: product.price,
      imageSnapshot: product.images?.[0] || '',
      quantity: 1,
      category: key
    }));

    const buildPcData = {
      items,
      totalPrice: subtotal,
      isBuildPc: true
    };

    // Lưu vào localStorage để CheckoutPage có thể đọc được
    localStorage.setItem('buildpc_checkout', JSON.stringify(buildPcData));
    
    // Điều hướng sang trang checkout
    navigate('/checkout');
  };

  return (
    <div className="space-y-4 sticky top-6">
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="font-bold text-gray-900 mb-4 text-base">Kiểm tra tương thích</h2>
        
        {compatibilityLoading ? (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 animate-pulse">
            <div className="w-6 h-6 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-2 bg-gray-200 rounded w-3/4" />
            </div>
          </div>
        ) : (
          <div className={`space-y-3`}>
            {/* Status Header */}
            <div className={`flex items-center gap-3 p-3 rounded-xl ${
              Object.keys(selectedItems || {}).length === 0 
                ? 'bg-gray-50' 
                : (!compatibilityResult || compatibilityResult.isCompatible ? 'bg-green-50' : 'bg-red-50')
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                Object.keys(selectedItems || {}).length === 0 
                  ? 'bg-gray-300' 
                  : (!compatibilityResult || compatibilityResult.isCompatible ? 'bg-green-500' : 'bg-red-500')
              }`}>
                {Object.keys(selectedItems || {}).length === 0 ? (
                  <Info size={14} className="text-white" />
                ) : (!compatibilityResult || compatibilityResult.isCompatible ? (
                  <Check size={14} className="text-white" />
                ) : (
                  <AlertCircle size={14} className="text-white" />
                ))}
              </div>
              <div>
                <p className={`text-xs font-bold ${
                  Object.keys(selectedItems || {}).length === 0 
                    ? 'text-gray-600' 
                    : (!compatibilityResult || compatibilityResult.isCompatible ? 'text-green-700' : 'text-red-700')
                }`}>
                  {Object.keys(selectedItems || {}).length === 0
                    ? 'Chưa chọn linh kiện'
                    : (!compatibilityResult || compatibilityResult.isCompatible ? 'Tương thích tốt' : 'Phát hiện vấn đề')}
                </p>
                <p className="text-[10px] text-gray-500">
                  {Object.keys(selectedItems || {}).length === 0
                    ? 'Vui lòng chọn linh kiện để kiểm tra'
                    : (!compatibilityResult || (compatibilityResult.issues?.length === 0 && compatibilityResult.warnings?.length === 0)
                      ? 'Cấu hình hiện tại ổn định' 
                      : `${compatibilityResult.issues?.length || 0} lỗi, ${compatibilityResult.warnings?.length || 0} cảnh báo`)}
                </p>
              </div>
            </div>

            {/* Issues List */}
            {compatibilityResult?.issues?.length > 0 && (
              <div className="space-y-2">
                {compatibilityResult.issues.map((issue, idx) => (
                  <div key={idx} className="flex gap-2 p-2 rounded-lg bg-red-50/50 border border-red-100">
                    <AlertCircle size={12} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-red-600 leading-tight">{issue.message}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Warnings List */}
            {compatibilityResult?.warnings?.length > 0 && (
              <div className="space-y-2">
                {compatibilityResult.warnings.map((warn, idx) => (
                  <div key={idx} className="flex gap-2 p-2 rounded-lg bg-yellow-50/50 border border-yellow-100">
                    <Info size={12} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-yellow-700 leading-tight">{warn.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="font-bold text-gray-900 mb-4 text-base">Cấu hình hiện tại</h2>
        <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
          {COMPONENT_GROUPS.map((group) => {
            const item = selectedItems[group.key];
            return (
              <div key={group.key} className="flex items-center gap-3 p-2 rounded-lg border border-gray-50 bg-gray-50/30 group">
                <div className="w-10 h-10 bg-white rounded border border-gray-100 flex items-center justify-center p-1 flex-shrink-0">
                  {item?.images?.[0] ? (
                    <img src={item.images[0]} alt="" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <div className="text-gray-300">{group.icon}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{group.label}</p>
                  <p className="text-xs font-bold text-gray-800 truncate">
                    {item ? item.name : 'Chưa chọn ' + group.label}
                  </p>
                </div>
                {item && (
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="text-xs font-bold text-gray-900">{formatVND(item.price).replace('₫', '')}₫</p>
                    <button 
                      onClick={() => onRemove(group.key)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded text-red-500 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
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
            onClick={handleSaveConfig}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 rounded-xl transition-all text-sm"
          >
            Lưu cấu hình
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BuildPcPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeCategory, setActiveCategory] = useState('cpu');
  const [allProducts, setAllProducts] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState({});
  const [compatibilityResult, setCompatibilityResult] = useState(null);
  const [compatibilityLoading, setCompatibilityLoading] = useState(false);

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

  // Kiểm tra tương thích mỗi khi selectedItems thay đổi
  useEffect(() => {
    const checkCompat = async () => {
      const keys = Object.keys(selectedItems);
      if (keys.length === 0) {
        setCompatibilityResult(null);
        return;
      }

      try {
        setCompatibilityLoading(true);
        const components = {};
        keys.forEach(k => {
          components[k] = selectedItems[k]._id;
        });
        const res = await checkBuildPcCompatibility(components);
        if (res.success) {
          setCompatibilityResult(res.data);
        }
      } catch (err) {
        console.error('Check compatibility error:', err);
      } finally {
        setCompatibilityLoading(false);
      }
    };

    const timer = setTimeout(checkCompat, 500);
    return () => clearTimeout(timer);
  }, [selectedItems]);

  // Fetch sản phẩm cho category hiện tại kèm theo filter tương thích
  const fetchProductsForCategory = useCallback(async (categoryKey, constraints = {}) => {
    try {
      const group = COMPONENT_GROUPS.find(g => g.key === categoryKey);
      if (!group) return;

      const params = { 
        category: group.categorySlug, 
        limit: 50,
        ...constraints 
      };
      
      const res = await getProducts(params);
      setAllProducts(prev => ({ ...prev, [categoryKey]: res?.data || [] }));
    } catch (err) {
      console.error(`Fetch ${categoryKey} error:`, err);
    }
  }, []);

  // Hiệu ứng fetch ban đầu và refetch khi có ràng buộc mới
  useEffect(() => {
    const fetchWithConstraints = async () => {
      setLoading(true);
      
      // Xác định ràng buộc dựa trên linh kiện đã chọn
      const constraints = {};
      
      if (activeCategory === 'mainboard') {
        const cpuSocket = getSpec(selectedItems.cpu, 'socket');
        if (cpuSocket) constraints.socket = cpuSocket;
      } else if (activeCategory === 'ram') {
        const mainRamType = getSpec(selectedItems.mainboard, 'ram_type');
        if (mainRamType) constraints.ram_type = mainRamType;
        else {
          const cpuRamType = getSpec(selectedItems.cpu, 'ram_type');
          if (cpuRamType) constraints.ram_type = cpuRamType;
        }
      } else if (activeCategory === 'case') {
        const mainForm = getSpec(selectedItems.mainboard, 'form_factor');
        if (mainForm) constraints.form_factor = mainForm;
      } else if (activeCategory === 'cpu' && selectedItems.mainboard) {
        const mainSocket = getSpec(selectedItems.mainboard, 'socket');
        if (mainSocket) constraints.socket = mainSocket;
      }

      await fetchProductsForCategory(activeCategory, constraints);
      setLoading(false);
    };

    fetchWithConstraints();
  }, [activeCategory, selectedItems.cpu, selectedItems.mainboard, fetchProductsForCategory, getSpec]);

  // Tự động lưu cấu hình mỗi khi selectedItems thay đổi
  useEffect(() => {
    if (authLoading) return;
    const userId = user?._id || user?.id;
    const storageKey = userId ? `buildpc_config_${userId}` : 'buildpc_config_guest';
    
    if (Object.keys(selectedItems).length > 0) {
      const payload = {
        selectedItems,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } else {
      // Nếu không còn linh kiện nào, có thể xóa key hoặc để trống
      localStorage.removeItem(storageKey);
    }
  }, [selectedItems, user, authLoading]);

  // Tải cấu hình đã lưu
  useEffect(() => {
    if (authLoading) return;
    const userId = user?._id || user?.id;
    const storageKey = userId ? `buildpc_config_${userId}` : 'buildpc_config_guest';
    const savedConfig = localStorage.getItem(storageKey);
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        if (parsed.selectedItems) setSelectedItems(parsed.selectedItems);
      } catch (e) { console.error('Load saved config error:', e); }
    }
  }, [user, authLoading]);

  const handleSelect = (product) => {
    setSelectedItems(prev => ({ ...prev, [activeCategory]: product }));
  };

  const handleRemove = (key) => {
    setSelectedItems(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const activeGroup = COMPONENT_GROUPS.find(g => g.key === activeCategory);
  const displayProducts = allProducts[activeCategory] || [];

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Sidebar: Categories */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sticky top-6">
              <h2 className="px-4 py-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Chọn linh kiện</h2>
              <nav className="space-y-1">
                {COMPONENT_GROUPS.map((group) => (
                  <button
                    key={group.key}
                    onClick={() => setActiveCategory(group.key)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      activeCategory === group.key
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {group.icon}
                      <span>{group.label}</span>
                    </div>
                    {selectedItems[group.key] && (
                      <Check size={14} className={activeCategory === group.key ? 'text-white' : 'text-green-500'} />
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Center: Product List */}
          <main className="flex-1">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{activeGroup?.label} - Bộ vi xử lý</h1>
              <p className="text-sm text-gray-500 font-medium">Chọn {activeGroup?.label} phù hợp cho cấu hình của bạn</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-80 bg-gray-200 rounded-2xl"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {displayProducts.length > 0 ? (
                  displayProducts.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      onSelect={handleSelect}
                      onRemove={() => handleRemove(activeCategory)}
                      isSelected={selectedItems[activeCategory]?._id === product._id}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
                    <div className="text-gray-300 mb-4 flex justify-center">{activeGroup?.icon}</div>
                    <p className="text-gray-500 font-bold">Không tìm thấy sản phẩm {activeGroup?.label}</p>
                  </div>
                )}
              </div>
            )}
          </main>

          {/* Right Sidebar: Summary */}
          <aside className="lg:w-80 flex-shrink-0">
            <RightSummary 
              selectedItems={selectedItems} 
              onRemove={handleRemove}
            />
          </aside>

        </div>
      </div>
      
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
      `}</style>
    </div>
  );
}
