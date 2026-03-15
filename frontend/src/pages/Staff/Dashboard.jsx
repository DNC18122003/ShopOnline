import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { 
    ShoppingCart, 
    Package, 
    FolderOpen, 
    Tag, 
    Clock, 
    Eye, 
    TrendingUp,
    RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';

const Dashboard = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalProducts: 0,
        totalCategories: 0,
        totalBrands: 0,
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            // Giả lập load API 
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Dữ liệu mẫu (sẽ thay bằng API sau)
            setStats({
                totalOrders: 145,
                totalProducts: 432,
                totalCategories: 12,
                totalBrands: 25,
            });
            
            setRecentOrders([
                { id: "ORD-001", customer: "Nguyễn Văn A", date: new Date().toLocaleDateString('vi-VN'), total: "1.500.000đ", status: "Chờ lấy hàng", statusColor: "bg-yellow-100 text-yellow-800" },
                { id: "ORD-002", customer: "Trần Thị B", date: new Date().toLocaleDateString('vi-VN'), total: "3.200.000đ", status: "Đang giao hàng", statusColor: "bg-blue-100 text-blue-800" },
                { id: "ORD-003", customer: "Lê Văn C", date: new Date().toLocaleDateString('vi-VN'), total: "550.000đ", status: "Giao thành công", statusColor: "bg-green-100 text-green-800" },
                { id: "ORD-004", customer: "Phạm Thị D", date: new Date().toLocaleDateString('vi-VN'), total: "2.100.000đ", status: "Đã hủy", statusColor: "bg-red-100 text-red-800" },
            ]);
            
            setLowStockProducts([
                { id: 1, name: "Bàn ăn mặt đá Ceramic", sku: "BA-001", stock: 3, price: "4.500.000đ" },
                { id: 2, name: "Ghế Sofa phòng khách chữ L", sku: "SF-002", stock: 1, price: "12.000.000đ" },
                { id: 3, name: "Giường ngủ bọc da cao cấp", sku: "GN-003", stock: 2, price: "8.500.000đ" },
            ]);
        } catch (error) {
            console.error("Failed to fetch staff dashboard data", error);
            toast.error("Không thể tải dữ liệu thống kê!");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                <span className="ml-2 text-gray-600 font-medium">Đang tải dữ liệu...</span>
            </div>
        );
    }

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
                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchDashboardData}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Làm mới dữ liệu"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    <div className="text-sm text-gray-500 font-medium bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                        Hôm nay: {new Date().toLocaleDateString('vi-VN')}
                    </div>
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
                                {recentOrders.length > 0 ? (
                                    recentOrders.map((order, idx) => (
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
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                            Chưa có đơn hàng nào gần đây
                                        </td>
                                    </tr>
                                )}
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
                        {lowStockProducts.length > 0 ? (
                            lowStockProducts.map((product) => (
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
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center text-gray-500 h-full py-8">
                                <Package className="w-10 h-10 text-gray-300 mb-2" />
                                <p>Không có sản phẩm nào sắp hết hàng</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
