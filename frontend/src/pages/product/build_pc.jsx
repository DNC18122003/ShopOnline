import React, { useEffect, useMemo, useState } from 'react';
import { Check, AlertCircle, ChevronDown, ChevronUp, X } from 'lucide-react';
import { getProducts } from '@/services/product/product.api';

const COMPONENT_GROUPS = [
  { key: 'cpu', label: 'CPU', categorySlug: 'cpu' },
  { key: 'main', label: 'Mainboard', categorySlug: 'mainboard' },
  { key: 'ram', label: 'RAM', categorySlug: 'ram' },
  { key: 'gpu', label: 'Card màn hình (GPU)', categorySlug: 'vga' },
  { key: 'ssd', label: 'Ổ cứng SSD', categorySlug: 'ssd' },
  { key: 'hdd', label: 'Ổ cứng HDD', categorySlug: 'hdd' },
  { key: 'psu', label: 'Nguồn (PSU)', categorySlug: 'psu' },
  { key: 'case', label: 'Vỏ case', categorySlug: 'case' },
];

const formatVND = (amount) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount || 0);


function ComponentSelector({ group, products, selected, onSelect, isExpanded, onToggle }) {
  return (
    <section className="border border-gray-200 rounded-lg mb-3 overflow-hidden bg-white shadow-sm">
      <header 
        className="px-4 py-2.5 border-b border-gray-200 flex items-center justify-between bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex-shrink-0">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm">{group.label}</h3>
            {selected ? (
              <p className="text-xs text-gray-600 mt-0.5 truncate">
                {selected.name}
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-0.5">
                {products.length > 0 ? `${products.length} sản phẩm` : 'Chưa có sản phẩm'}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {selected && (
            <>
              <span className="text-sm font-semibold text-blue-600">
                {formatVND(selected.price)}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(group.key, null);
                }}
                className="ml-2 p-1 hover:bg-red-100 rounded transition-colors"
                title="Xóa lựa chọn"
              >
                <X className="w-3 h-3 text-red-500" />
              </button>
            </>
          )}
        </div>
      </header>

      {isExpanded && (
        <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
          {products.length === 0 ? (
            <div className="px-4 py-4 text-sm text-gray-500 text-center">
              <p>Không có sản phẩm tương thích</p>
              <p className="text-xs mt-1 text-gray-400">
                Hãy chọn linh kiện khác hoặc thay đổi lựa chọn hiện tại
              </p>
            </div>
          ) : (
            products.map((p) => (
              <button
                key={p._id}
                type="button"
                onClick={() => {
                  onSelect(group.key, p);
                  onToggle();
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-blue-50 transition-colors ${
                  selected?._id === p._id ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">
                    {p.name}
                  </p>
                  {p.specifications && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {p.specifications.socket && `Socket: ${p.specifications.socket} `}
                      {p.specifications.ram_type && `RAM: ${p.specifications.ram_type} `}
                      {p.specifications.form_factor && `Form: ${p.specifications.form_factor} `}
                      {p.specifications.wattage && `${p.specifications.wattage}W`}
                    </p>
                  )}
                </div>
                <span className="text-sm font-semibold text-blue-600 flex-shrink-0">
                  {formatVND(p.price)}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </section>
  );
}

function OrderSummary({ selectedItems }) {
  const tax = 10; // %

  const subtotal = useMemo(() => {
    return Object.values(selectedItems).reduce((sum, item) => {
      return sum + (item?.price || 0);
    }, 0);
  }, [selectedItems]);

  const taxAmount = Math.round(subtotal * (tax / 100));
  const total = subtotal + taxAmount;

  // Logic kiểm tra tương thích chi tiết
  const compatibilityCheck = useMemo(() => {
    const cpu = selectedItems.cpu;
    const main = selectedItems.main;
    const ram = selectedItems.ram;
    const psu = selectedItems.psu;
    const caseItem = selectedItems.case;

    const issues = [];

    // Kiểm tra có đủ linh kiện cơ bản
    if (!cpu) issues.push('Chưa chọn CPU');
    if (!main) issues.push('Chưa chọn Mainboard');
    if (!ram) issues.push('Chưa chọn RAM');
    if (!psu) issues.push('Chưa chọn Nguồn');

    // Kiểm tra tương thích socket (CPU ↔ Mainboard)
    if (cpu && main) {
      const cpuSocket = cpu.specifications?.socket;
      const mainSocket = main.specifications?.socket;
      if (cpuSocket && mainSocket && cpuSocket !== mainSocket) {
        issues.push('CPU và Mainboard không tương thích (socket khác nhau)');
      }
    }

    // Kiểm tra tương thích RAM type (Mainboard ↔ RAM)
    if (main && ram) {
      const mainRamType = main.specifications?.ram_type;
      const ramType = ram.specifications?.ram_type;
      if (mainRamType && ramType && mainRamType !== ramType) {
        issues.push('Mainboard và RAM không tương thích (loại RAM khác nhau)');
      }
    }

    // Kiểm tra tương thích form factor (Mainboard ↔ Case)
    if (main && caseItem) {
      const mainFormFactor = main.specifications?.form_factor;
      const caseFormFactors = caseItem.specifications?.form_factor;
      if (mainFormFactor && caseFormFactors) {
        const supportedFormFactors = Array.isArray(caseFormFactors)
          ? caseFormFactors
          : [caseFormFactors];
        if (!supportedFormFactors.includes(mainFormFactor)) {
          issues.push('Mainboard và Case không tương thích (form factor)');
        }
      }
    }

    return {
      isCompatible: issues.length === 0 && cpu && main && ram && psu,
      issues,
    };
  }, [selectedItems]);

  const { isCompatible, issues } = compatibilityCheck;

  const selectedCount = Object.values(selectedItems).filter(Boolean).length;

  return (
    <aside className="w-full lg:w-80 lg:pl-4 mt-6 lg:mt-0">
      <div className="bg-white rounded-lg shadow-sm p-4 sticky top-20 space-y-4">
        {/* Compatibility Check */}
        <div>
          <div
            className={`flex items-start gap-2 p-3 rounded-lg ${
              isCompatible
                ? 'bg-green-50 border border-green-200'
                : 'bg-yellow-50 border border-yellow-200'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                isCompatible ? 'bg-green-500' : 'bg-yellow-500'
              }`}
            >
              {isCompatible ? (
                <Check size={12} className="text-white" />
              ) : (
                <AlertCircle size={12} className="text-white" />
              )}
            </div>
            <span
              className={`text-xs font-medium ${
                isCompatible ? 'text-green-700' : 'text-yellow-700'
              }`}
            >
              {isCompatible
                ? 'Cấu hình tương thích'
                : 'Cần: CPU, Main, RAM, PSU'}
            </span>
          </div>
        </div>

        {/* Selected Items Summary */}
        {selectedCount > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 text-sm mb-2">
              Đã chọn ({selectedCount}/{COMPONENT_GROUPS.length})
            </h3>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {COMPONENT_GROUPS.map((g) => {
                const item = selectedItems[g.key];
                if (!item) return null;
                return (
                  <div
                    key={g.key}
                    className="flex items-start justify-between p-2 bg-gray-50 rounded text-xs"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-medium text-gray-700 truncate">{g.label}</p>
                      <p className="text-gray-500 truncate">{item.name}</p>
                    </div>
                    <span className="font-semibold text-blue-600 flex-shrink-0">
                      {formatVND(item.price)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Price Summary */}
        <div className="border-t border-gray-200 pt-3 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Tạm tính:</span>
            <span className="text-gray-900 font-semibold">
              {formatVND(subtotal)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Thuế (10%):</span>
            <span className="text-gray-900 font-semibold">
              {formatVND(taxAmount)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="font-bold text-gray-900 text-sm">Tổng:</span>
            <span className="text-xl font-bold text-blue-600">
              {formatVND(total)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={!isCompatible || selectedCount === 0}
          >
            Thanh toán ngay
          </button>
          <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-lg transition-colors text-sm">
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>
    </aside>
  );
}

// Hàm kiểm tra tương thích giữa các linh kiện
const isCompatible = (product, groupKey, selectedItems) => {
  if (!product?.specifications) return true;

  const specs = product.specifications;

  // Mainboard phải tương thích với CPU (socket) - kiểm tra cả 2 chiều
  if (groupKey === 'main' && selectedItems.cpu) {
    const cpuSocket = selectedItems.cpu.specifications?.socket;
    if (cpuSocket && specs.socket && specs.socket !== cpuSocket) {
      return false;
    }
  }

  // CPU phải tương thích với Mainboard đã chọn (socket) - kiểm tra cả 2 chiều
  if (groupKey === 'cpu' && selectedItems.main) {
    const mainSocket = selectedItems.main.specifications?.socket;
    if (mainSocket && specs.socket && specs.socket !== mainSocket) {
      return false;
    }
  }

  // RAM phải tương thích với Mainboard (ram_type)
  if (groupKey === 'ram' && selectedItems.main) {
    const mainRamType = selectedItems.main.specifications?.ram_type;
    if (mainRamType && specs.ram_type && specs.ram_type !== mainRamType) {
      return false;
    }
  }

  // Case phải tương thích với Mainboard (form_factor)
  if (groupKey === 'case' && selectedItems.main) {
    const mainFormFactor = selectedItems.main.specifications?.form_factor;
    if (mainFormFactor && specs.form_factor && specs.form_factor !== mainFormFactor) {
      return false;
    }
  }

  // PSU: Kiểm tra công suất (tính tổng công suất các linh kiện)
  if (groupKey === 'psu') {
    let totalWattage = 0;
    
    // Ước tính công suất tiêu thụ (đơn giản)
    if (selectedItems.cpu) totalWattage += 100; // CPU ~100W
    if (selectedItems.gpu) totalWattage += 200; // GPU ~200W
    if (selectedItems.main) totalWattage += 50; // Mainboard ~50W
    if (selectedItems.ram) totalWattage += 20; // RAM ~20W
    if (selectedItems.ssd) totalWattage += 10; // SSD ~10W
    if (selectedItems.hdd) totalWattage += 15; // HDD ~15W
    
    // Thêm 20% buffer
    totalWattage = totalWattage * 1.2;
    
    if (specs.wattage && specs.wattage < totalWattage) {
      return false;
    }
  }

  return true;
};

// Hàm lọc sản phẩm tương thích
const filterCompatibleProducts = (allProducts, selectedItems) => {
  const filtered = {};
  
  COMPONENT_GROUPS.forEach((group) => {
    const products = allProducts[group.key] || [];
    filtered[group.key] = products.filter((product) =>
      isCompatible(product, group.key, selectedItems)
    );
  });
  
  return filtered;
};

export default function BuildPcPage() {
  const [allProducts, setAllProducts] = useState({});
  const [productsByGroup, setProductsByGroup] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState({});
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  // Fetch tất cả sản phẩm ban đầu
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const responses = await Promise.all(
          COMPONENT_GROUPS.map((g) =>
            getProducts({ category: g.categorySlug, limit: 50 }),
          ),
        );

        const mapped = {};
        COMPONENT_GROUPS.forEach((g, index) => {
          const res = responses[index];
          mapped[g.key] = res?.data || [];
        });

        setAllProducts(mapped);
        setProductsByGroup(mapped);
      } catch (err) {
        console.error('Fetch build PC products error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // Filter sản phẩm khi selectedItems thay đổi
  useEffect(() => {
    const filtered = filterCompatibleProducts(allProducts, selectedItems);
    setProductsByGroup(filtered);
  }, [selectedItems, allProducts]);

  const handleSelect = (groupKey, product) => {
    setSelectedItems((prev) => {
      if (product === null) {
        // Khi xóa một linh kiện, xóa các linh kiện phụ thuộc
        const next = { ...prev };
        delete next[groupKey];
        
        // Nếu xóa CPU, xóa Mainboard (vì mainboard phụ thuộc CPU socket)
        if (groupKey === 'cpu') {
          delete next.main;
        }
        
        // Nếu xóa Mainboard, xóa RAM và Case (vì phụ thuộc mainboard)
        if (groupKey === 'main') {
          delete next.ram;
          delete next.case;
        }
        
        return next;
      }
      
      // Khi chọn sản phẩm mới, kiểm tra và xóa các linh kiện không tương thích
      const next = { ...prev, [groupKey]: product };
      
      // Nếu chọn CPU mới, kiểm tra mainboard hiện tại
      if (groupKey === 'cpu' && next.main) {
        const cpuSocket = product.specifications?.socket;
        const mainSocket = next.main.specifications?.socket;
        if (cpuSocket && mainSocket && cpuSocket !== mainSocket) {
          delete next.main;
          delete next.ram; // RAM cũng phụ thuộc mainboard
          delete next.case; // Case cũng phụ thuộc mainboard
        }
      }
      
      // Nếu chọn Mainboard mới, kiểm tra CPU, RAM, Case hiện tại
      if (groupKey === 'main') {
        const mainSocket = product.specifications?.socket;
        const mainRamType = product.specifications?.ram_type;
        const mainFormFactor = product.specifications?.form_factor;
        
        // Kiểm tra CPU
        if (next.cpu) {
          const cpuSocket = next.cpu.specifications?.socket;
          if (mainSocket && cpuSocket && mainSocket !== cpuSocket) {
            delete next.cpu;
          }
        }
        
        // Kiểm tra RAM
        if (next.ram) {
          const ramType = next.ram.specifications?.ram_type;
          if (mainRamType && ramType && mainRamType !== ramType) {
            delete next.ram;
          }
        }
        
        // Kiểm tra Case
        if (next.case) {
          const caseFormFactor = next.case.specifications?.form_factor;
          if (mainFormFactor && caseFormFactor && mainFormFactor !== caseFormFactor) {
            delete next.case;
          }
        }
      }
      
      // Nếu chọn RAM mới, kiểm tra mainboard
      if (groupKey === 'ram' && next.main) {
        const mainRamType = next.main.specifications?.ram_type;
        const ramType = product.specifications?.ram_type;
        if (mainRamType && ramType && mainRamType !== ramType) {
          // Không nên xóa mainboard, chỉ cảnh báo (hoặc không cho chọn)
          // Nhưng để đơn giản, ta sẽ xóa mainboard
          delete next.main;
          delete next.case;
        }
      }
      
      // Nếu chọn Case mới, kiểm tra mainboard
      if (groupKey === 'case' && next.main) {
        const mainFormFactor = next.main.specifications?.form_factor;
        const caseFormFactor = product.specifications?.form_factor;
        if (mainFormFactor && caseFormFactor && mainFormFactor !== caseFormFactor) {
          delete next.main;
          delete next.ram;
        }
      }
      
      return next;
    });
  };

  const toggleGroup = (groupKey) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            Build PC
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Chọn linh kiện phù hợp với ngân sách và nhu cầu của bạn
          </p>
        </header>

        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
          <main className="flex-1 lg:max-w-2xl">
            {loading && (
              <div className="mb-4 text-sm text-gray-500 text-center py-4">
                Đang tải danh sách linh kiện...
              </div>
            )}

            {COMPONENT_GROUPS.map((group) => (
              <ComponentSelector
                key={group.key}
                group={group}
                products={productsByGroup[group.key] || []}
                selected={selectedItems[group.key]}
                onSelect={handleSelect}
                isExpanded={expandedGroups.has(group.key)}
                onToggle={() => toggleGroup(group.key)}
              />
            ))}
          </main>

          <OrderSummary selectedItems={selectedItems} />
        </div>
      </div>
    </div>
  );
}
