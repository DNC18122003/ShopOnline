import { Star, TrendingUp, ShoppingCart, Eye, Users, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import saleDashboardService from '@/services/SaleDashboard/saleDashboard.api';
import { AuthContext } from '@/context/authContext';
export default function SalesDashboard() {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [dashboardData, setDashboardData] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalBlogs: 0,
        totalReviews: 0,
        topDiscounts: [],
        topBlogs: [],
        orderCurrent: [],
    });
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                console.log('User ID being sent to API:', user._id ? user._id : user.id);
                const response = await saleDashboardService.getDashboardSummary(
                    selectedMonth,
                    selectedYear,
                    user._id ? user._id : user.id,
                );
                console.log('Response from getDashboardSummary API:', response.data);

                const result = response.data?.data || response.data;

                if (result) {
                    setDashboardData({
                        totalOrders: result.orderResult || 0,
                        totalBlogs: result.totalBlogs || 0,
                        totalReviews: result.totalReviews || 0,
                        topDiscounts: result.topDiscounts || [],
                        topBlogs: result.topBlogs || [],
                        orderRecent: result.orderRecent || [],
                    });
                }
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu dashboard:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [selectedMonth, selectedYear]);
    const years = Array.from({ length: 4 }, (_, i) => currentYear - 3 + i);
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card
                    className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 p-6 text-white"
                    onClick={() => navigate('/sale/orders')}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-blue-100 text-sm mb-1">Đơn hàng</p>
                            <p className="text-3xl font-bold">{dashboardData.totalOrders}</p>
                        </div>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <ShoppingCart className="w-5 h-5" />
                        </div>
                    </div>
                </Card>

                <Card
                    className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 p-6 text-white"
                    onClick={() => navigate('/sale/blog')}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-blue-100 text-sm mb-1">Tin tức mới</p>
                            <p className="text-3xl font-bold">{dashboardData.totalBlogs}</p>
                        </div>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Eye className="w-5 h-5" />
                        </div>
                    </div>
                </Card>

                <Card
                    className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 p-6 text-white"
                    onClick={() => navigate('/sale/review')}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-blue-100 text-sm mb-1">Đánh giá mới</p>
                            <p className="text-3xl font-bold">{dashboardData.totalReviews}</p>
                        </div>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Promotions and Blog */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Promotions */}
                <Card className="p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Mã giảm giá được sử dụng nhiều</h3>
                    <div className="space-y-3">
                        {isLoading ? (
                            <p className="text-center text-gray-500 py-4">Đang tải...</p>
                        ) : dashboardData.topDiscounts?.length > 0 > 0 ? (
                            dashboardData.topDiscounts.slice(0, 5).map((discount, index) => (
                                <div
                                    key={index}
                                    className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            {/* Tên mã code */}
                                            <p className="font-semibold text-gray-900">{discount.code}</p>
                                            {/* Số lượt đã sử dụng */}
                                            <p className="text-sm text-gray-600">Đã dùng: {discount.usedCount} lượt</p>
                                        </div>
                                        {/* Giá trị giảm: Kiểm tra xem là % hay tiền mặt */}
                                        <span className="text-sm font-bold text-blue-600">
                                            {discount.discountType === 'percent'
                                                ? `Giảm ${discount.value}%`
                                                : `Giảm ${discount.value.toLocaleString()}đ`}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-8">Không có mã giảm giá nào</p>
                        )}
                    </div>
                </Card>

                {/* Best Sellers */}
                <Card className="p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Bài viết nổi bật</h3>
                    <div className="space-y-3">
                        {isLoading ? (
                            <p className="text-center text-gray-500 py-4">Đang tải...</p>
                        ) : dashboardData.topBlogs?.length > 0 /* Đã sửa lỗi dư chữ > 0 ở đây */ ? (
                            dashboardData.topBlogs.slice(0, 5).map((blog, index) => (
                                <div
                                    key={index}
                                    className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors bg-white"
                                >
                                    {/* Dùng flex và gap-4 để tạo khoảng cách giữa ảnh và nội dung */}
                                    <div className="flex items-center gap-4">
                                        {/* 1. Phần Ảnh Thumbnail */}
                                        <img
                                            // Nếu không có thumbnail thì hiện ảnh placeholder tạm thời
                                            src={blog.thumbnail || 'https://placehold.co/400x300?text=No+Image'}
                                            alt={blog.title}
                                            className="w-16 h-16 object-cover rounded-md border border-gray-100 flex-shrink-0"
                                        />

                                        {/* 2. Phần Nội dung (Tiêu đề, Tác giả, Lượt xem) */}
                                        <div className="flex-1 min-w-0">
                                            {/* Tiêu đề bài viết (dùng line-clamp-1 để cắt dấu ... nếu tên quá dài) */}
                                            <p className="font-semibold text-gray-900 truncate" title={blog.title}>
                                                {blog.title}
                                            </p>

                                            {/* Tác giả */}
                                            <p className="text-sm text-gray-600 mt-0.5">
                                                Tác giả: {blog.author || 'Quản trị viên'}
                                            </p>

                                            {/* Lượt xem */}
                                            <p className="text-xs text-gray-500 mt-1 inline-flex items-center bg-gray-100 px-2 py-0.5 rounded-full">
                                                👁 Lượt xem: {blog.viewCount}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-8">Không có bài viết nào được tạo mới</p>
                        )}
                    </div>
                </Card>
            </div>

            {/* Product Quality and Sales Table */}
            <Card className="p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Đơn hàng gần đây</h3>
                    <button
                        onClick={() => navigate('/sale/orders')}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Xem tất cả
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="px-4 py-3 text-sm font-semibold text-gray-700">Mã đơn hàng</th>
                                <th className="px-4 py-3 text-sm font-semibold text-gray-700">Ngày tạo</th>
                                <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                                    Phương thức Thanh Toán
                                </th>
                                <th className="px-4 py-3 text-sm font-semibold text-gray-700">Thanh toán</th>
                                <th className="px-4 py-3 text-sm font-semibold text-gray-700">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-gray-500">
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : dashboardData.orderRecent?.length > 0 ? (
                                dashboardData.orderRecent.map((order) => (
                                    <tr
                                        key={order._id}
                                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                            {/* Rút gọn mã đơn hàng nếu quá dài */}
                                            <span
                                                className="truncate max-w-[150px] inline-block"
                                                title={order.orderCode}
                                            >
                                                {order.orderCode}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {new Date(order.createdAt).toLocaleString('vi-VN')}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 font-medium">
                                            {order.paymentMethod}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    order.paymentStatus === 'paid'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                }`}
                                            >
                                                {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    order.orderStatus === 'confirmed'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : order.orderStatus === 'pending'
                                                          ? 'bg-orange-100 text-orange-700'
                                                          : order.orderStatus === 'completed'
                                                            ? 'bg-green-100 text-green-700' /* Thêm màu xanh lá cho hoàn thành */
                                                            : order.orderStatus === 'cancelled'
                                                              ? 'bg-red-100 text-red-700' /* Thêm màu đỏ cho đã hủy */
                                                              : 'bg-gray-100 text-gray-700'
                                                }`}
                                            >
                                                {order.orderStatus === 'confirmed'
                                                    ? 'Đã xác nhận'
                                                    : order.orderStatus === 'pending'
                                                      ? 'Chờ xử lý'
                                                      : order.orderStatus === 'completed'
                                                        ? 'Hoàn thành' /* Hiển thị text tiếng Việt */
                                                        : order.orderStatus === 'cancelled'
                                                          ? 'Đã hủy' /* Hiển thị text tiếng Việt */
                                                          : order.orderStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-gray-500">
                                        Không có đơn hàng nào trong thời gian này
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
