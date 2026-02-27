import React, { useEffect, useState } from 'react';
import { Search, Calendar, Eye, Truck, RotateCcw, Star, Funnel,RotateCcwIcon,Clock,CircleCheck,CircleX } from 'lucide-react';
import { getMyOrders } from '@/services/customer/order.api';
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
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await getMyOrders();
            setOrders(data || []);
            console.log('Data:',data)
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = (id) => {
        navigate(`/orders/${id}`);
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
                    Tổng đơn hàng: <span className="text-blue-600 font-semibold">{orders.length}</span>
                </div>
            </div>

            {/* Filter Box (UI giống ảnh - chưa xử lý logic filter) */}
            <div className="bg-white p-4 rounded-2xl shadow-sm mb-6">
                <div className="grid md:grid-cols-4 gap-4">
                    <div>
                        <label className="text-sm text-gray-500">Tìm kiếm</label>
                        <div className="flex items-center border rounded-lg px-2 mt-1">
                            <Search size={16} className="text-gray-400" />
                            <input type="text" placeholder="Mã đơn hàng..." className="w-full p-2 outline-none" />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-gray-500">Trạng thái</label>
                        <select className="w-full border rounded-lg p-2 mt-1">
                            <option>Tất cả trạng thái</option>
                            <option>Chờ xử lý</option>
                            <option>Đang giao</option>
                            <option>Hoàn thành</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm text-gray-500">Từ ngày</label>
                        <div className="flex items-center border rounded-lg px-2 mt-1">
                            <Calendar size={16} className="text-gray-400" />
                            <input type="date" className="w-full p-2 outline-none" />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-gray-500">Đến ngày</label>
                        <div className="flex items-center border rounded-lg px-2 mt-1">
                            <Calendar size={16} className="text-gray-400" />
                            <input type="date" className="w-full p-2 outline-none" />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-4">
                    <button className="bg-blue-600 text-white px-4 py-2 flex rounded-lg text-sm gap-2">
                        <Funnel size={16} /> Lọc
                    </button>
                    <button className="bg-gray-200 px-4 py-2 flex rounded-lg text-sm gap-2">
                        <RotateCcwIcon size={16} />Đặt lại
                    </button>
                </div>
            </div>

            {/* Loading */}
            {loading && <div className="text-center py-10 text-gray-500">Đang tải đơn hàng...</div>}

            {/* Order List */}
            {!loading && (
                <div className="space-y-4">
                    {orders.map((order) => {
                       const status = statusConfig[order.orderStatus] || statusConfig.pending;
                       const Icon = status.icon;
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
                                            className={`px-3 py-1 text-xs rounded-full flex items-center gap-1 ${status.className}`}
                                        >
                                            <Icon size={14} />
                                            {status.label}
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
                                        {/* {(order.status === 'completed' || order.status === 'delivered') && (
                                            <>
                                                <button className="flex items-center gap-1 border px-3 py-2 rounded-lg text-sm">
                                                    <RotateCcw size={14} /> Mua lại
                                                </button>
                                                <button className="flex items-center gap-1 bg-yellow-400 text-white px-3 py-2 rounded-lg text-sm">
                                                    <Star size={14} /> Đánh giá
                                                </button>
                                            </>
                                        )} */}

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
        </div>
    );
};

export default MyOrderPage;
