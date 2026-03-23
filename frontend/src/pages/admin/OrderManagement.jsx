import React, { useEffect, useState } from 'react';
import { Search, Eye, Package, Clock, Truck, DollarSign } from 'lucide-react';
import { getAllOrders,updateOrderStatus } from '@/services/order/order.api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import warningIcon from '../../assets/warning.png';
const statusFlow = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['shipping'],
    shipping: ['delivered', 'delivery_failed'],
    delivered: ['completed', 'returned'],
};
const OrderManagement = () => {
  
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [datePreset, setDatePreset] = useState('');
    const [totalOrders, setTotalOrders] = useState(0);
    const [orders, setOrders] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, [page]);

    useEffect(() => {
        setPage(1);
    }, [search, statusFilter, paymentMethodFilter, paymentStatusFilter, fromDate, toDate]);

   const fetchOrders = async () => {
       try {
           const res = await getAllOrders(page, limit);

           setOrders(res.orders); 
           setTotalOrders(res.total || 0);
           setTotalPages(res.totalPages);
       } catch (error) {
           console.error(error);
       }
   };

    const formatPrice = (price) => {
        return (price || 0).toLocaleString('vi-VN') + ' đ';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-700';

            case 'confirmed':
                return 'bg-blue-100 text-blue-700';

            case 'shipping':
                return 'bg-purple-100 text-purple-700';

            case 'delivered':
                return 'bg-green-100 text-green-700';

            case 'completed':
                return 'bg-emerald-100 text-emerald-700';

            case 'cancelled':
                return 'bg-red-100 text-red-600';

            case 'delivery_failed':
                return 'bg-orange-100 text-orange-700';

            case 'returned':
                return 'bg-gray-200 text-gray-700';

            default:
                return 'bg-gray-100 text-gray-600';
        }
    };
    const formatAssignStatus = (status) => {
        switch (status) {
            case 'waiting':
                return {
                    label: 'Đang chờ sale',
                    className: 'bg-yellow-100 text-yellow-700',
                };

            case 'accepted':
                return {
                    label: 'Sale đã nhận',
                    className: 'bg-green-100 text-green-700',
                };

            case 'timeout':
                return {
                    label: 'Sale không phản hồi',
                    className: 'bg-red-100 text-red-600',
                };

            case 'rejected':
                return {
                    label: 'Sale từ chối',
                    className: 'bg-gray-200 text-gray-700',
                };

            default:
                return {
                    label: 'Chưa có',
                    className: 'bg-gray-100 text-gray-500',
                };
        }
    };

    const getPaymentStyle = (method) => {
        switch (method) {
            case 'COD':
                return 'bg-orange-100 text-orange-700';
            case 'MOMOPAY':
                return 'bg-pink-100 text-pink-700';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    const getPaymentStatusStyle = (status) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-700';
            case 'unpaid':
                return 'bg-red-100 text-red-700';
            case 'refunded':
                return 'bg-gray-200 text-gray-700';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    const handleDatePreset = (value) => {
        setDatePreset(value);

        const today = new Date();
        let past = new Date();

        if (value === 'today') {
            const todayStr = today.toISOString().split('T')[0];
            setFromDate(todayStr);
            setToDate(todayStr);
        }

        if (value === '7days') {
            past.setDate(today.getDate() - 7);
            setFromDate(past.toISOString().split('T')[0]);
            setToDate(today.toISOString().split('T')[0]);
        }

        if (value === '30days') {
            past.setDate(today.getDate() - 30);
            setFromDate(past.toISOString().split('T')[0]);
            setToDate(today.toISOString().split('T')[0]);
        }

        if (value === '') {
            setFromDate('');
            setToDate('');
        }
    };

    useEffect(() => {
        if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
            toast.error('Ngày bắt đầu phải nhỏ hơn ngày kết thúc');
            setToDate('');
        }
    }, [fromDate, toDate]);

    const setToday = () => {
        const today = new Date().toISOString().split('T')[0];
        setFromDate(today);
        setToDate(today);
    };

    const setLast7Days = () => {
        const today = new Date();
        const past = new Date();
        past.setDate(today.getDate() - 7);

        setFromDate(past.toISOString().split('T')[0]);
        setToDate(today.toISOString().split('T')[0]);
    };

    const setLast30Days = () => {
        const today = new Date();
        const past = new Date();
        past.setDate(today.getDate() - 30);

        setFromDate(past.toISOString().split('T')[0]);
        setToDate(today.toISOString().split('T')[0]);
    };

    const resetFilter = () => {
        setSearch('');
        setStatusFilter('');
        setPaymentMethodFilter('');
        setPaymentStatusFilter('');
        setFromDate('');
        setToDate('');
    };

const filteredOrders = (orders || []).filter((order) => {
    const orderDate = new Date(order?.createdAt);

    const matchSearch =
        order?.orderCode?.toLowerCase().includes(search.toLowerCase()) ||
        order?.shippingAddress?.fullName?.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter ? order?.orderStatus === statusFilter : true;

    const matchPaymentMethod = paymentMethodFilter ? order?.paymentMethod === paymentMethodFilter : true;

    const matchPaymentStatus = paymentStatusFilter ? order?.paymentStatus === paymentStatusFilter : true;

    const matchFromDate = fromDate ? orderDate >= new Date(fromDate) : true;

    const matchToDate = toDate ? orderDate <= new Date(toDate) : true;

    return matchSearch && matchStatus && matchPaymentMethod && matchPaymentStatus && matchFromDate && matchToDate;
});
  

    const paginatedOrders = filteredOrders;

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            <div className="grid grid-cols-4 gap-6">
                <div className="bg-blue-100 border-2 border-blue-200 p-5 rounded-xl flex justify-between">
                    <div>
                        <p className="text-sm text-gray-600">Tổng đơn hàng</p>
                        <h2 className="text-2xl font-bold">{totalOrders}</h2>
                    </div>
                    <Package className="text-blue-600" size={32} />
                </div>

                <div className="bg-yellow-100 border-2 border-yellow-200 p-5 rounded-xl flex justify-between">
                    <div>
                        <p className="text-sm text-gray-600">Chờ xử lý</p>
                        <h2 className="text-2xl font-bold">
                            {orders.filter((o) => o?.orderStatus === 'pending').length}
                        </h2>
                    </div>
                    <Clock className="text-yellow-600" size={32} />
                </div>

                <div className="bg-green-100 border-2 border-green-200 p-5 rounded-xl flex justify-between">
                    <div>
                        <p className="text-sm text-gray-600">Đã xác nhận</p>
                        <h2 className="text-2xl font-bold">
                            {orders.filter((o) => o?.orderStatus === 'confirmed').length}
                        </h2>
                    </div>
                    <Truck className="text-green-600" size={32} />
                </div>

                <div className="bg-purple-100 border-2 border-purple-200 p-5 rounded-xl flex justify-between">
                    <div>
                        <p className="text-sm text-gray-600">Doanh thu</p>
                        <h2 className="text-2xl font-bold">
                            {formatPrice(orders.reduce((sum, o) => sum + (o.finalAmount || 0), 0))}
                        </h2>
                    </div>
                    <DollarSign className="text-purple-600" size={32} />
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow space-y-4">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center border rounded-lg px-3 py-2 w-80">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Tìm mã đơn / khách hàng"
                            className="outline-none ml-2 w-full"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <input
                        type="date"
                        className="border rounded-lg px-3 py-2"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                    />

                    <input
                        type="date"
                        className="border rounded-lg px-3 py-2"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                    />

                    <select
                        className="border rounded-lg px-3 py-2"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">Trạng thái đơn</option>
                        <option value="pending">Chờ xử lý</option>
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="shipping">Đang giao</option>
                        <option value="cancelled">Hủy</option>
                    </select>

                    <select
                        className="border rounded-lg px-3 py-2"
                        value={paymentMethodFilter}
                        onChange={(e) => setPaymentMethodFilter(e.target.value)}
                    >
                        <option value="">Phương thức</option>
                        <option value="COD">COD</option>
                        <option value="MOMOPAY">Momo</option>
                    </select>

                    <select
                        className="border rounded-lg px-3 py-2"
                        value={paymentStatusFilter}
                        onChange={(e) => setPaymentStatusFilter(e.target.value)}
                    >
                        <option value="">Thanh toán</option>
                        <option value="paid">Đã thanh toán</option>
                        <option value="unpaid">Chưa thanh toán</option>
                        <option value="refunded">Hoàn tiền</option>
                    </select>
                    <select
                        className="border rounded-lg px-3 py-2"
                        value={datePreset}
                        onChange={(e) => handleDatePreset(e.target.value)}
                    >
                        <option value="">Khoảng thời gian</option>
                        <option value="today">Hôm nay</option>
                        <option value="7days">7 ngày gần đây</option>
                        <option value="30days">30 ngày gần đây</option>
                    </select>

                    <button onClick={resetFilter} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                        Reset
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 text-left text-sm text-gray-600">
                        <tr>
                            <th className="p-4">Mã đơn</th>
                            <th>Sale tiếp nhận</th>
                            <th>Trạng thái tiếp nhận</th>
                            <th>Ngày đặt</th>
                            <th>Phương thức</th>
                            <th>Thanh toán</th>
                            <th>Trạng thái</th>
                            <th>Tổng tiền</th>
                            <th className="text-center">Thao tác</th>
                        </tr>
                    </thead>

                    <tbody>
                        {paginatedOrders.map((order) => (
                            <tr
                                key={order._id}
                                className={`border-t hover:bg-gray-50 ${order.stockWarning ? 'bg-red-300' : ''}`}
                            >
                                <td className="p-4 font-medium flex items-center gap-2">
                                    <span className={order.isOverSell ? 'text-red-600' : 'text-blue-600'}>
                                        #{order.orderCode?.slice(0, 8)}
                                    </span>

                                    {order.stockWarning && (
                                        <div className="relative group">
                                            <img src={warningIcon} className="w-4 h-4 cursor-pointer" />

                                            <div
                                                className="absolute bottom-6 left-1/2 -translate-x-1/2 
                                                hidden group-hover:block 
                                                text-red-400 text-xs 
                                                px-2 py-1 rounded whitespace-nowrap"
                                            >
                                                Đơn này đang thiếu hàng
                                            </div>
                                        </div>
                                    )}
                                </td>

                                <td>
                                    {order.assignedSale ? (
                                        <div>
                                            <p className="font-medium">
                                                {order.assignedSale?.fullName} ({order.assignedSale?.userName})
                                            </p>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">Chưa gán</span>
                                    )}
                                </td>
                                <td>
                                    {(() => {
                                        const status = formatAssignStatus(order?.assignmentStatus);

                                        return (
                                            <span className={`text-xs px-2 py-1 rounded ${status.className}`}>
                                                {status.label}
                                            </span>
                                        );
                                    })()}
                                </td>
                                <td>{formatDate(order.createdAt)}</td>

                                <td>
                                    <span
                                        className={`px-2 py-1 text-xs rounded ${getPaymentStyle(order.paymentMethod)}`}
                                    >
                                        {order.paymentMethod}
                                    </span>
                                </td>

                                <td>
                                    <span
                                        className={`px-2 py-1 text-xs rounded ${getPaymentStatusStyle(
                                            order.paymentStatus,
                                        )}`}
                                    >
                                        {order.paymentStatus}
                                    </span>
                                </td>

                                <td>
                                    <span className={`px-2 py-1 text-xs rounded ${getStatusStyle(order.orderStatus)}`}>
                                        {order.orderStatus}
                                    </span>
                                </td>

                                <td className="font-medium">{formatPrice(order.finalAmount)}</td>
                                <td className="text-center">
                                    <div className="flex justify-center items-center gap-2">
                                        <button
                                            className="p-2 hover:bg-gray-100 rounded"
                                            onClick={() => navigate(`/admin/order/${order._id}`)}
                                        >
                                            <Eye className="text-blue-500 hover:text-blue-700" size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="flex justify-center items-center gap-3 py-4">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="px-3 py-1 border rounded disabled:opacity-40"
                    >
                        Prev
                    </button>

                    <span className="text-sm">
                        Trang {page} / {totalPages || 1}
                    </span>

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="px-3 py-1 border rounded disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>

                {filteredOrders.length === 0 && <p className="text-center py-6 text-gray-500">Không có đơn hàng</p>}
            </div>
        </div>
    );
};

export default OrderManagement;
