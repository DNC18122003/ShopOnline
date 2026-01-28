import React, { useEffect, useMemo, useState } from 'react';
import { Check, AlertCircle } from 'lucide-react';
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

function ComponentSelector({ group, products, selected, onSelect }) {
  return (
    <section className="border border-gray-200 rounded-lg mb-4 overflow-hidden bg-white">
      <header className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div>
          <h3 className="font-semibold text-gray-900">{group.label}</h3>
          {selected ? (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
              Đã chọn: {selected.name}
            </p>
          ) : (
            <p className="text-xs text-gray-500 mt-0.5">Chưa chọn linh kiện</p>
          )}
        </div>
        {selected && (
          <span className="text-sm font-semibold text-blue-600">
            {formatVND(selected.price)}
          </span>
        )}
      </header>

      <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
        {products.length === 0 ? (
          <div className="px-4 py-6 text-sm text-gray-500 text-center">
            Chưa có sản phẩm cho nhóm này
          </div>
        ) : (
          products.map((p) => (
            <button
              key={p._id}
              type="button"
              onClick={() => onSelect(group.key, p)}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-blue-50 transition-colors ${
                selected?._id === p._id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 line-clamp-2">
                  {p.name}
                </p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {p.shortDescription || p.description}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-sm font-semibold text-blue-600">
                  {formatVND(p.price)}
                </span>
                {selected?._id === p._id && (
                  <span className="text-xs text-green-600 font-medium">
                    Đã chọn
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
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

  // Logic tương thích cơ bản: yêu cầu có CPU, Main, RAM, PSU
  const isCompatible =
    !!selectedItems.cpu &&
    !!selectedItems.main &&
    !!selectedItems.ram &&
    !!selectedItems.psu;

  return (
    <aside className="w-full lg:w-1/3 lg:pl-6 mt-8 lg:mt-0">
      <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24 space-y-6">
        <div>
          <h3 className="font-bold text-gray-900 mb-3">Kiểm tra tương thích</h3>
          <div
            className={`flex items-center gap-3 p-4 rounded-lg ${
              isCompatible
                ? 'bg-green-50 border border-green-200'
                : 'bg-yellow-50 border border-yellow-200'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isCompatible ? 'bg-green-500' : 'bg-yellow-500'
              }`}
            >
              {isCompatible ? (
                <Check size={16} className="text-white" />
              ) : (
                <AlertCircle size={16} className="text-white" />
              )}
            </div>
            <span
              className={`text-sm font-medium ${
                isCompatible ? 'text-green-700' : 'text-yellow-700'
              }`}
            >
              {isCompatible
                ? 'Cấu hình cơ bản đã đầy đủ và tương thích.'
                : 'Hãy chọn tối thiểu CPU, Main, RAM và Nguồn để đảm bảo tương thích.'}
            </span>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-gray-900 mb-3">Cấu hình hiện tại</h3>
          <div className="space-y-2 text-sm">
            {COMPONENT_GROUPS.map((g) => {
              const item = selectedItems[g.key];
              return (
                <div
                  key={g.key}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-gray-700">
                    {item ? `${g.label}: ${item.name}` : `Chưa chọn ${g.label}`}
                  </span>
                  {item && (
                    <span className="font-semibold text-blue-600">
                      {formatVND(item.price)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tạm tính:</span>
            <span className="text-gray-900 font-semibold">
              {formatVND(subtotal)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Thuế (10%):</span>
            <span className="text-gray-900 font-semibold">
              {formatVND(taxAmount)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="font-bold text-gray-900">Tổng cộng:</span>
            <span className="text-2xl font-bold text-blue-600">
              {formatVND(total)}
            </span>
          </div>
        </div>

        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
          Thanh toán ngay
        </button>

        <p className="text-xs text-center text-gray-500">
          Bạn có thể lưu cấu hình này hoặc thêm vào giỏ hàng ở bước sau.
        </p>
      </div>
    </aside>
  );
}

export default function BuildPcPage() {
  const [productsByGroup, setProductsByGroup] = useState({});
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
          const res = responses[index];
          mapped[g.key] = res?.data || [];
        });

        setProductsByGroup(mapped);
      } catch (err) {
        console.error('Fetch build PC products error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const handleSelect = (groupKey, product) => {
    setSelectedItems((prev) => ({
      ...prev,
      [groupKey]: product,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Build PC theo nhu cầu của bạn
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl">
            Chọn từng linh kiện phù hợp với ngân sách và mục đích sử dụng. Hệ
            thống sẽ giúp bạn tính tổng chi phí và kiểm tra cấu hình cơ bản.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          <main className="flex-1">
            {loading && (
              <div className="mb-4 text-sm text-gray-500">
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
              />
            ))}
          </main>

          <OrderSummary selectedItems={selectedItems} />
        </div>
      </div>
    </div>
  );
}
