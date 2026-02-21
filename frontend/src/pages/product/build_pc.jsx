import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, AlertCircle, Cpu, Monitor, HardDrive, Layout, Zap, Thermometer, Box, Trash2 } from 'lucide-react';
import { getProducts } from '@/services/product/product.api';
import { toast } from 'react-toastify';

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

function ProductCard({ product, onSelect, isSelected }) {
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
      <button
        onClick={() => onSelect(product)}
        className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
          isSelected 
            ? 'bg-green-500 text-white hover:bg-green-600' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isSelected ? 'Đã thêm' : 'Thêm vào cấu hình'}
      </button>
    </div>
  );
}

function RightSummary({ selectedItems, onRemove }) {
  const navigate = useNavigate();
  const subtotal = useMemo(() => {
    return Object.values(selectedItems).reduce((sum, item) => sum + (item?.price || 0), 0);
  }, [selectedItems]);

  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  const compatibility = useMemo(() => {
    const issues = [];
    if (!selectedItems.cpu) issues.push('CPU');
    if (!selectedItems.mainboard) issues.push('Mainboard');
    if (!selectedItems.ram) issues.push('RAM');
    
    return {
      isOK: issues.length === 0,
      missing: issues
    };
  }, [selectedItems]);

  const handleCheckout = () => {
    const selectedCount = Object.keys(selectedItems).length;
    if (selectedCount === 0) {
      toast.warning('Vui lòng chọn ít nhất một linh kiện để thanh toán');
      return;
    }

    if (!compatibility.isOK) {
      toast.info(`Cấu hình chưa đầy đủ (Thiếu: ${compatibility.missing.join(', ')}). Bạn vẫn có thể tiếp tục thanh toán.`);
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
        <div className={`flex items-center gap-3 p-3 rounded-xl ${compatibility.isOK ? 'bg-green-50' : 'bg-blue-50'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${compatibility.isOK ? 'bg-green-500' : 'bg-blue-500'}`}>
            {compatibility.isOK ? <Check size={14} className="text-white" /> : <AlertCircle size={14} className="text-white" />}
          </div>
          <div>
            <p className={`text-xs font-bold ${compatibility.isOK ? 'text-green-700' : 'text-blue-700'}`}>
              {compatibility.isOK ? 'Tương thích hoàn toàn' : 'Đang xây dựng cấu hình'}
            </p>
            <p className="text-[10px] text-gray-500">
              {compatibility.isOK ? 'Tất cả linh kiện hoạt động tốt' : `Còn thiếu: ${compatibility.missing.join(', ')}`}
            </p>
          </div>
        </div>
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
          <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 rounded-xl transition-all text-sm">
            Lưu cấu hình
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BuildPcPage() {
  const [activeCategory, setActiveCategory] = useState('cpu');
  const [allProducts, setAllProducts] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState({});

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const responses = await Promise.all(
          COMPONENT_GROUPS.map((g) =>
            getProducts({ category: g.categorySlug, limit: 20 }),
          ),
        );

        const mapped = {};
        COMPONENT_GROUPS.forEach((g, index) => {
          mapped[g.key] = responses[index]?.data || [];
        });

        setAllProducts(mapped);
      } catch (err) {
        console.error('Fetch build PC products error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

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
              <h1 className="text-2xl font-black text-gray-900 mb-1">{activeGroup?.label} - Bộ vi xử lý</h1>
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
