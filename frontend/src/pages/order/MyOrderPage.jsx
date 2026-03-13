import React, { useEffect, useState } from 'react';
import {
    Search,
    Calendar,
    Eye,
    Truck,
    RotateCcw,
    Star,
    Funnel,
    RotateCcwIcon,
    Clock,
    CircleCheck,
    CircleX,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { getMyOrders, cancelOrder } from '@/services/order/order.api';
import { useNavigate } from 'react-router-dom';
const statusConfig = {
    pending: {
        label: 'Chờ xử lý',
        className: 'bg-yellow-100 text-yellow-600',
        icon: Clock,
    },
    confirmed: {
        label: 'Đã xác nhận',
        className: 'bg-teal-100 text-blue-600',
        icon: CircleCheck,
    },

    shipping: {
        label: 'Đang giao',
        className: 'bg-blue-100 text-blue-600',
        icon: Truck,
    },

    completed: {
        label: 'Hoàn thành',
        className: 'bg-green-100 text-green-600',
        icon: CircleCheck,
    },
    cancelled: {
        label: 'Hủy',
        className: 'bg-red-100 text-red-600',
        icon: CircleX,
    },
};

const MyOrderPage = () => {
    const [orders, setOrders] = useState([]);
    const [totalOrders, setTotalOrders] = useState(0);
    const [loading, setLoading] = useState(false);
    const [cancelOrderId, setCancelOrderId] = useState(null);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    const limit = 5;
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, [page, search, status, fromDate, toDate]);

    const fetchOrders = async () => {
        try {
            setLoading(true);

            const params = {
                page,
                limit,
                search,
                status,
                fromDate,
                toDate,
            };

            const res = await getMyOrders(params);
            console.log('params', params);
            console.log('res', res);
            setOrders(res.orders || []);
            setTotalPages(res.totalPages || 1);

            setTotalOrders(res.total || 0);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    const handleViewDetail = (id) => {
        navigate(`/orders/${id}`);
    };
    const handleCancel = async () => {
        try {
            setCancelLoading(true);
            await cancelOrder(cancelOrderId);
            setCancelOrderId(null);
            await fetchOrders();
        } catch (error) {
            console.error(error);
        } finally {
            setCancelLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Đơn Hàng Của Tôi</h1>
                    <p className="text-gray-500 text-sm">Quản lý và theo dõi tất cả đơn hàng của bạn</p>
                </div>

                <div className="bg-white px-4 py-2 rounded-xl shadow-sm text-sm">
                    Tổng đơn hàng: <span className="text-blue-600 font-semibold">{totalOrders}</span>
                </div>
            </div>

            {/* Filter Box (UI giống ảnh - chưa xử lý logic filter) */}
            <div className="bg-white p-4 rounded-2xl shadow-sm mb-6">
                <div className="grid md:grid-cols-4 gap-4">
                    <div>
                        <label className="text-sm text-gray-500">Tìm kiếm</label>
                        <div className="flex items-center border rounded-lg px-2 mt-1">
                            <Search size={16} className="text-gray-400" />
                            <input
                                type="text"
                                placeholder="Mã đơn hàng..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full p-2 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-gray-500">Trạng thái</label>
                        <select
                            className="w-full border rounded-lg p-2 mt-1"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="pending">Chờ xử lý</option>
                            <option value="confirmed">Đã xác nhận</option>
                            <option value="shipping">Đang giao</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm text-gray-500">Từ ngày</label>
                        <div className="flex items-center border rounded-lg px-2 mt-1">
                            <Calendar size={16} className="text-gray-400" />
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="w-full p-2 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-gray-500">Đến ngày</label>
                        <div className="flex items-center border rounded-lg px-2 mt-1">
                            <Calendar size={16} className="text-gray-400" />
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="w-full p-2 outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-4">
                    <button
                        onClick={() => {
                            setPage(1);
                            fetchOrders();
                        }}
                        className="bg-blue-600 text-white px-4 py-2 flex rounded-lg text-sm gap-2"
                    >
                        <Funnel size={16} /> Lọc
                    </button>
                    <button
                        onClick={() => {
                            setSearch('');
                            setStatus('');
                            setFromDate('');
                            setToDate('');
                            setPage(1);
                            fetchOrders();
                        }}
                        className="bg-gray-200 px-4 py-2 flex rounded-lg text-sm gap-2"
                    >
                        <RotateCcwIcon size={16} />
                        Đặt lại
                    </button>
                </div>
            </div>

            {/* Loading */}
            {loading && <div className="text-center py-10 text-gray-500">Đang tải đơn hàng...</div>}

            {/* Order List */}
            {!loading && (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const statusInfo = statusConfig[order.orderStatus] || statusConfig.pending;
                        const Icon = statusInfo.icon;
                        return (
                            <div key={order._id} className="bg-white rounded-2xl shadow-sm p-5">
                                {/* Top */}
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="font-semibold">#{order.orderCode || order._id.slice(-8)}</h2>
                                        <p className="text-sm text-gray-500">
                                            Đặt ngày: {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <span
                                            className={`px-3 py-1 text-xs rounded-full flex items-center gap-1 ${statusInfo.className}`}
                                        >
                                            <Icon size={14} />
                                            {statusInfo.label}
                                        </span>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400">Tổng tiền</p>
                                            <p className="text-blue-600 font-bold">
                                                {order.finalAmount?.toLocaleString('vi-VN')}đ
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom */}
                                <div className="flex justify-between items-center mt-4 border-t pt-4">
                                    <div className="text-sm text-gray-500 flex gap-4">
                                        <span>{order.items?.length || 0} sản phẩm</span>
                                        <span className="flex items-center gap-1">
                                            <Truck size={14} />
                                            {order.shippingMethod || 'Giao hàng tiêu chuẩn'}
                                        </span>
                                    </div>

                                    <div className="flex gap-3">
                                        {order.orderStatus === 'pending' && (
                                            <button
                                                className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm transition"
                                                onClick={() => setCancelOrderId(order._id)}
                                            >
                                                <CircleX size={14} /> Hủy đơn
                                            </button>
                                        )}
                                        {order.orderStatus === 'completed' &&
                                            (order.items?.every((item) => item.reviewed) ? (
                                                <button
                                                    className="flex items-center gap-1 border border-gray-400 text-gray-500 px-3 py-2 rounded-lg text-sm"
                                                    onClick={() => navigate(`/review/${order._id}`)}
                                                >
                                                    <Eye size={14} /> Xem đánh giá
                                                </button>
                                            ) : (
                                                <button
                                                    className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm"
                                                    onClick={() => navigate(`/review/${order._id}`)}
                                                >
                                                    <Star size={14} /> Đánh giá
                                                </button>
                                            ))}
                                        <button
                                            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition"
                                            onClick={() => handleViewDetail(order._id)}
                                        >
                                            <Eye size={14} /> Xem chi tiết
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {orders.length === 0 && (
                        <div className="text-center py-10 text-gray-400">Bạn chưa có đơn hàng nào.</div>
                    )}
                </div>
            )}
            {cancelOrderId && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">
                        <h2 className="text-lg font-semibold mb-2 text-gray-800">Xác nhận hủy đơn</h2>

                        <p className="text-sm text-gray-500 mb-6">
                            Bạn có chắc muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setCancelOrderId(null)}
                                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm"
                                disabled={cancelLoading}
                            >
                                Đóng
                            </button>

                            <button
                                onClick={handleCancel}
                                disabled={cancelLoading}
                                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm flex items-center gap-2"
                            >
                                {cancelLoading ? 'Đang hủy...' : 'Xác nhận hủy'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex justify-center gap-2 mt-6">
                <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                    <ChevronLeft size={18} />
                </button>

                <span className="px-3 py-1">
                    Page {page} / {totalPages}
                </span>

                <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default MyOrderPage;
