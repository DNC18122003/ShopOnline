import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { 
    Package, 
    FolderOpen, 
    Tag, 
    Clock, 
    RefreshCw,
    Box
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getStaffDashboardData } from '@/services/dashboard/dashboard.api';

const Dashboard = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalCategories: 0,
        totalBrands: 0,
    });
    const [latestProducts, setLatestProducts] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            const response = await getStaffDashboardData();
            
            if (response.success) {
                setStats(response.data.stats);
                setLatestProducts(response.data.latestProducts);
                setLowStockProducts(response.data.lowStockProducts);
            }
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
                        Quản lý toàn diện sản phẩm, danh mục và thương hiệu
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium mb-1">Sản phẩm kích hoạt</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
                        </div>
                        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                            <Package className="w-8 h-8" />
                        </div>
                    </div>
                </Card>

                <Card className="bg-white border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium mb-1">Danh mục</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalCategories}</p>
                        </div>
                        <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl">
                            <FolderOpen className="w-8 h-8" />
                        </div>
                    </div>
                </Card>

                <Card className="bg-white border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium mb-1">Thương hiệu</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalBrands}</p>
                        </div>
                        <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
                            <Tag className="w-8 h-8" />
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Latest Products */}
                <Card className="xl:col-span-2 border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="text-lg font-semibold text-gray-900">Sản phẩm mới thêm</h3>
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Xem tất cả</button>
                    </div>
                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 bg-white uppercase border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Sản phẩm</th>
                                    <th className="px-6 py-4 font-medium">Danh mục</th>
                                    <th className="px-6 py-4 font-medium">Ngày thêm</th>
                                    <th className="px-6 py-4 font-medium">Giá</th>
                                    <th className="px-6 py-4 font-medium text-center">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {latestProducts.length > 0 ? (
                                    latestProducts.map((product, idx) => (
                                        <tr key={idx} className="bg-white hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-900">{product.name}</span>
                                                    <span className="text-[10px] text-gray-400">SKU: {product.sku}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-xs">
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                <div className="flex items-center">
                                                    <Clock className="w-3.5 h-3.5 mr-1" />
                                                    {product.date}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-900">{product.price}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                                    product.isActive 
                                                    ? "bg-green-100 text-green-700" 
                                                    : "bg-gray-100 text-gray-400"
                                                }`}>
                                                    {product.isActive ? "ĐANG BÁN" : "ẨN"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-50">
                                            Chưa có sản phẩm nào
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
                                <div key={product.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex-shrink-0 flex items-center justify-center border border-gray-200">
                                        <Box className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate" title={product.name}>
                                            {product.name}
                                        </p>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-[10px] text-gray-400 font-medium">SKU: {product.sku}</span>
                                            <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg">
                                                Còn {product.stock}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center text-gray-500 h-full py-8">
                                <Package className="w-12 h-12 text-gray-200 mb-2" />
                                <p className="font-medium">Kho hàng ổn định</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
