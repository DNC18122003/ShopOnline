import React from 'react';
import { Card } from '@/components/ui/card';
import { 
    ShoppingCart, 
    Package, 
    FolderOpen, 
    Tag, 
    Clock, 
    Eye, 
    TrendingUp
} from 'lucide-react';

const Dashboard = () => {
    // Mock data for statistics
    const stats = {
        totalOrders: 156,
        totalProducts: 1248,
        totalCategories: 24,
        totalBrands: 45,
    };

    // Mock data for recent orders
    const recentOrders = [
        { id: '#ORD-001', customer: 'Nguyễn Văn A', date: '13/03/2026', total: '15,000,000đ', status: 'Đang xử lý', statusColor: 'bg-yellow-100 text-yellow-800' },
        { id: '#ORD-002', customer: 'Trần Thị B', date: '12/03/2026', total: '4,500,000đ', status: 'Đã giao', statusColor: 'bg-green-100 text-green-800' },
        { id: '#ORD-003', customer: 'Lê C', date: '11/03/2026', total: '32,100,000đ', status: 'Chờ thanh toán', statusColor: 'bg-blue-100 text-blue-800' },
        { id: '#ORD-004', customer: 'Phạm D', date: '10/03/2026', total: '8,900,000đ', status: 'Đã hủy', statusColor: 'bg-red-100 text-red-800' },
    ];

    // Mock data for low stock products
    const lowStockProducts = [
        { id: 1, name: 'Laptop ASUS ROG Strix G15', sku: 'ASUS-ROG-G15', stock: 3, price: '25,990,000đ' },
        { id: 2, name: 'Chuột Logitech G Pro X Superlight', sku: 'LOGI-GPRO-X', stock: 5, price: '2,990,000đ' },
        { id: 3, name: 'Bàn phím cơ Akko 3098B', sku: 'AKKO-3098B', stock: 2, price: '1,890,000đ' },
    ];

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Tổng quan Nhân viên</h2>
                    <p className="text-sm text-gray-500">
                        Theo dõi hoạt động kinh doanh và quản lý cửa hàng
                    </p>
                </div>
                <div className="text-sm text-gray-500 font-medium">
                    Hôm nay: {new Date().toLocaleDateString('vi-VN')}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium mb-1">Tổng đơn hàng</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                            <ShoppingCart className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-green-500 font-medium">+12%</span>
                        <span className="text-gray-400 ml-2">so với tháng trước</span>
                    </div>
                </Card>

                <Card className="bg-white border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium mb-1">Sản phẩm</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                        </div>
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
                            <Package className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-green-500 font-medium">+5%</span>
                        <span className="text-gray-400 ml-2">so với tháng trước</span>
                    </div>
                </Card>

                <Card className="bg-white border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium mb-1">Danh mục</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalCategories}</p>
                        </div>
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-full">
                            <FolderOpen className="w-6 h-6" />
                        </div>
                    </div>
                </Card>

                <Card className="bg-white border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium mb-1">Thương hiệu</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalBrands}</p>
                        </div>
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-full">
                            <Tag className="w-6 h-6" />
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <Card className="xl:col-span-2 border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="text-lg font-semibold text-gray-900">Đơn hàng gần đây</h3>
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
                            Xem tất cả
                            <Eye className="w-4 h-4 ml-1" />
                        </button>
                    </div>
                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 bg-white uppercase border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Mã ĐH</th>
                                    <th className="px-6 py-4 font-medium">Khách hàng</th>
                                    <th className="px-6 py-4 font-medium">Ngày đặt</th>
                                    <th className="px-6 py-4 font-medium">Tổng tiền</th>
                                    <th className="px-6 py-4 font-medium text-center">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentOrders.map((order, idx) => (
                                    <tr key={idx} className="bg-white hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                                        <td className="px-6 py-4 text-gray-700">{order.customer}</td>
                                        <td className="px-6 py-4 text-gray-500">
                                            <div className="flex items-center">
                                                <Clock className="w-3.5 h-3.5 mr-1" />
                                                {order.date}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{order.total}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${order.statusColor}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Low Stock Alerts */}
                <Card className="border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            Cảnh báo hết hàng
                            <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs font-bold">
                                {lowStockProducts.length}
                            </span>
                        </h3>
                    </div>
                    <div className="p-6 space-y-5 flex-1">
                        {lowStockProducts.map((product) => (
                            <div key={product.id} className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center border border-gray-200">
                                    <Package className="w-5 h-5 text-gray-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate" title={product.name}>
                                        {product.name}
                                    </p>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-xs text-gray-500">SKU: {product.sku}</span>
                                        <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                                            Còn {product.stock}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-gray-100 bg-white">
                        <button className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition-colors border border-gray-200 shadow-sm">
                            Xem báo cáo kho
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
