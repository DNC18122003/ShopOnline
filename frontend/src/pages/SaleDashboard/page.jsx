import { Star, TrendingUp, ShoppingCart, Eye, Users, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useState } from 'react';

export function SalesDashboard({ vouchers = [] }) {
    const totalRevenue = 945250000;
    const totalOrders = 127;
    const totalViews = 8744280;
    const totalUsers = 89;
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);

    const topProducts = [
        {
            id: 1,
            name: 'SSS Samsung 32B',
            sku: 'SKU-STM',
            image: 'https://via.placeholder.com/60x60?text=Product1',
            rating: 5,
            price: '19,999,000',
            date: '10/03/2026',
            status: 'Active',
        },
        {
            id: 2,
            name: 'Neutro Cosmic AM2002',
            sku: 'SKU-AM2',
            image: 'https://via.placeholder.com/60x60?text=Product2',
            rating: 4,
            price: '5,299,000',
            date: '09/03/2026',
            status: 'Active',
        },
        {
            id: 3,
            name: 'Mastercard ASUS ROG 3090',
            sku: 'SKU-ASUS',
            image: 'https://via.placeholder.com/60x60?text=Product3',
            rating: 4,
            price: '12,999,000',
            date: '08/03/2026',
            status: 'Active',
        },
        {
            id: 4,
            name: 'Niggle Cooler Master 750K',
            sku: 'SKU-COOL',
            image: 'https://via.placeholder.com/60x60?text=Product4',
            rating: 3,
            price: '8,499,000',
            date: '07/03/2026',
            status: 'Active',
        },
    ];

    const years = Array.from({ length: 4 }, (_, i) => currentYear - 3 + i);
    // Thêm logic lọc dữ liệu dựa trên Tháng và Năm
    const filteredProducts = topProducts.filter((product) => {
        const [day, month, year] = product.date.split('/');
        const productMonth = parseInt(month, 10);
        const productYear = parseInt(year, 10);

        const matchMonth = selectedMonth === 0 || productMonth === selectedMonth;
        const matchYear = selectedYear === 0 || productYear === selectedYear;

        return matchMonth && matchYear;
    });

    return (
        <div className="space-y-6">
            {/* 2. Header & Filter Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Tổng quan kinh doanh</h2>
                    <p className="text-sm text-gray-500">
                        {/* Cập nhật dòng chữ hiển thị Năm */}
                        Hiển thị dữ liệu cho Tháng {selectedMonth === 0 ? 'Tất cả' : selectedMonth}, Năm{' '}
                        {selectedYear === 0 ? 'Tất cả' : selectedYear}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500 hidden sm:block" />

                    {/* Filter Tháng */}
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none cursor-pointer bg-gray-50 hover:bg-white transition-colors"
                    >
                        <option value={0}>Tất cả các tháng</option>
                        {[...Array(12)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                                Tháng {i + 1}
                            </option>
                        ))}
                    </select>

                    {/* Filter Năm */}
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none cursor-pointer bg-gray-50 hover:bg-white transition-colors"
                    >
                        {/* Đã thêm option Tất cả các năm vào đây */}
                        <option value={0}>Tất cả các năm</option>
                        {years.map((y) => (
                            <option key={y} value={y}>
                                Năm {y}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Top Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 p-6 text-white">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-blue-100 text-sm mb-1">Doanh thu</p>
                            <p className="text-3xl font-bold">{totalRevenue.toLocaleString()}đ</p>
                        </div>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 p-6 text-white">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-blue-100 text-sm mb-1">Đơn hàng</p>
                            <p className="text-3xl font-bold">{totalOrders.toLocaleString()}</p>
                        </div>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <ShoppingCart className="w-5 h-5" />
                        </div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 p-6 text-white">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-blue-100 text-sm mb-1">Lượt xem blog</p>
                            <p className="text-3xl font-bold">{totalViews.toLocaleString()}</p>
                        </div>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Eye className="w-5 h-5" />
                        </div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 p-6 text-white">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-blue-100 text-sm mb-1">Đánh giá mới</p>
                            <p className="text-3xl font-bold">{totalUsers.toLocaleString()}</p>
                        </div>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Promotions and Best Sellers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Promotions */}
                <Card className="p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Mã giảm giá được sử dụng nhiều</h3>
                    <div className="space-y-3">
                        {vouchers.length > 0 ? (
                            vouchers.slice(0, 3).map((voucher) => (
                                <div
                                    key={voucher.id}
                                    className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-semibold text-gray-900">{voucher.code}</p>
                                            <p className="text-sm text-gray-600">Valid until {voucher.endDate}</p>
                                        </div>
                                        <span className="text-sm font-bold text-blue-600">{voucher.discountValue}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-8">No active promotions</p>
                        )}
                    </div>
                </Card>

                {/* Best Sellers */}
                <Card className="p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Bài viết được xem nhiều</h3>
                    <div className="space-y-3">
                        {/* Đổi topProducts thành filteredProducts để áp dụng bộ lọc */}
                        {filteredProducts.slice(0, 3).map((product) => (
                            <div
                                key={product.id}
                                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-12 h-12 rounded object-cover bg-gray-100"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                                    <p className="text-xs text-gray-600">SKU: {product.sku}</p>
                                </div>
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-3 h-3 ${i < product.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Product Quality and Sales Table */}
            <Card className="p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Chất lượng sản phẩm</h3>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all</button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Product</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                    Manufacturer
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rating</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Supplier</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Đổi topProducts thành filteredProducts để bảng tự động lọc */}
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-10 h-10 rounded object-cover bg-gray-100"
                                                />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                                    <p className="text-xs text-gray-600">{product.sku}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">Tech Corp</td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-3 h-3 ${i < product.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                                    />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                            {product.price}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{product.date}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                {product.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-block w-6 h-4 text-lg">🇻🇳</span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                        Không có dữ liệu
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
