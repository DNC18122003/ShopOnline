import React, { useEffect, useState } from 'react';
import { Eye, Clock, AlertCircle, Search } from 'lucide-react';

import { updateOrderStatus } from '@/services/order/order.api';
import { getMySaleOrders } from '@/services/SaleDashboard/sale.api';

import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import StatusDropdown from '../../components/ui/StatusDropdown';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

const saleStatusFlow = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['shipping', 'cancelled'],
    shipping: ['delivered', 'delivery_failed'],
    delivered: ['completed', 'returned'],
};

const orderStatusLabel = {
    pending: 'Chờ xử lý',
    confirmed: 'Đã xác nhận',
    shipping: 'Đang giao',
    delivered: 'Đã giao',
    completed: 'Hoàn tất',
    cancelled: 'Đã huỷ',
    returned: 'Trả hàng',
    delivery_failed: 'Giao thất bại',
};

const paymentStatusLabel = {
    paid: 'Đã thanh toán',
    unpaid: 'Chưa thanh toán',
    refunded: 'Đã hoàn tiền',
};

 const orderStatusStyle = {
     pending: 'bg-yellow-100 text-yellow-700',
     confirmed: 'bg-blue-100 text-blue-700',
     shipping: 'bg-indigo-100 text-indigo-700',
     delivered: 'bg-purple-100 text-purple-700',
     completed: 'bg-green-100 text-green-700',
     cancelled: 'bg-red-100 text-red-700',
     returned: 'bg-gray-100 text-gray-700',
     delivery_failed: 'bg-red-200 text-red-800',
 };
const paymentMethodLabel = {
    COD: 'COD',
    MOMOPAY: 'MOMO',
};


const OrderProcessing = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [paymentFilter, setPaymentFilter] = useState('');
    const navigate = useNavigate();

    const limit = 10;

    const fetchOrders = async () => {
        try {
            setLoading(true);

            const res = await getMySaleOrders(page, 10, statusFilter);
           
            setOrders(res || []);
            setTotalPages(res?.pagination?.totalPages || 1);
        } catch (error) {
            toast.error('Không thể tải đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [page, statusFilter]);

    const confirmUpdateStatus = async () => {
        try {
            await updateOrderStatus(selectedOrder, selectedStatus);

            toast.success(`Đã cập nhật: ${orderStatusLabel[selectedStatus]}`);

            setConfirmOpen(false);

            fetchOrders();
        } catch {
            toast.error('Không thể cập nhật trạng thái');
        }
    };

   const filteredOrders = orders.filter((order) => {
       const keyword = search.toLowerCase();

       const matchSearch =
           order.orderCode?.toLowerCase().includes(keyword) ||
           order.shippingAddress?.fullName?.toLowerCase().includes(keyword);

       const matchPayment = !paymentFilter || order.paymentMethod === paymentFilter;

       return matchSearch && matchPayment;
   });

    
   
    return (
        <div className="p-6 bg-slate-50 min-h-screen space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">Xử lý đơn hàng</h1>

              
            </div>

            {/* FILTER */}

            <div className="bg-white p-4 rounded-xl shadow flex gap-4 flex-wrap">
                <div className="flex items-center border rounded-lg px-3 py-2 w-72">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Tìm mã đơn / khách"
                        className="outline-none ml-2 w-full"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <select
                    className="border rounded-lg px-3 py-2"
                    value={statusFilter}
                    onChange={(e) => {
                        setPage(1);
                        setStatusFilter(e.target.value);
                    }}
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="pending">Chờ xử lý</option>
                    <option value="confirmed">Đã xác nhận</option>
                    <option value="shipping">Đang giao</option>
                    <option value="completed">Hoàn tất</option>
                    <option value="cancelled">Đã huỷ</option>
                </select>

                <select
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                    className="border rounded px-3 py-2 text-sm"
                >
                    <option value="">Tất cả phương thức thanh toán</option>
                    <option value="COD">COD</option>
                    <option value="MOMOPAY">MoMo</option>
                </select>
            </div>

            {/* TABLE */}

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b text-slate-600 text-sm font-medium">
                        <tr>
                            <th className="p-4">Đơn hàng</th>
                            <th>Khách hàng</th>
                            <th>Thanh toán</th>
                            <th>Phương thức</th>
                            <th>Trạng thái</th>
                            <th className="text-center">Cập nhật</th>
                            <th className="text-right p-4">Chi tiết</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y">
                        {filteredOrders.map((order) => (
                            <tr key={order._id} className="hover:bg-slate-50">
                                <td className="p-4">
                                    <div className="font-bold text-slate-800">#{order.orderCode?.slice(0, 8)}</div>

                                    <div className="text-xs text-slate-400">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </div>
                                </td>

                                <td>
                                    <div className="text-sm font-medium">{order.shippingAddress?.fullName}</div>

                                    <div className="text-xs text-slate-500">{order.shippingAddress?.phone}</div>
                                </td>

                                <td>
                                    <span
                                        className={`text-xs px-2 py-1 rounded ${
                                            order.paymentStatus === 'paid'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                        }`}
                                    >
                                        {paymentStatusLabel[order.paymentStatus]}
                                    </span>
                                </td>
                                <td>
                                    <span
                                        className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                            order.paymentMethod === 'MOMOPAY'
                                                ? 'bg-pink-100 text-pink-600'
                                                : 'bg-gray-100 text-gray-700'
                                        }`}
                                    >
                                        {paymentMethodLabel[order.paymentMethod]}
                                    </span>
                                </td>

                                <td>
                                    <span
                                        className={`text-xs px-3 py-1 rounded-full font-semibold uppercase ${
                                            orderStatusStyle[order.orderStatus]
                                        }`}
                                    >
                                        {orderStatusLabel[order.orderStatus]}
                                    </span>
                                </td>

                                <td className="text-center">
                                    <StatusDropdown
                                        order={order}
                                        statusFlow={saleStatusFlow}
                                        onChange={(id, status) => {
                                            setSelectedOrder(id);
                                            setSelectedStatus(status);
                                            setConfirmOpen(true);
                                        }}
                                    />
                                </td>

                                <td className="text-right p-4">
                                    <button
                                        onClick={() => navigate(`/sale/orders/${order._id}`)}
                                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-full"
                                    >
                                        <Eye size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {orders.length === 0 && !loading && <EmptyState message="Bạn chưa có đơn hàng nào." />}
            </div>

            {/* PAGINATION */}

            <div className="flex justify-center gap-4">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1 border rounded disabled:opacity-40"
                >
                    Prev
                </button>

                <span>
                    Trang {page} / {totalPages}
                </span>

                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1 border rounded disabled:opacity-40"
                >
                    Next
                </button>
            </div>

            <ConfirmDialog
                open={confirmOpen}
                setOpen={setConfirmOpen}
                title="Cập nhật trạng thái đơn"
                message={`Xác nhận chuyển đơn sang "${orderStatusLabel[selectedStatus]}"?`}
                onConfirm={confirmUpdateStatus}
            />
        </div>
    );
};

const EmptyState = ({ message }) => (
    <div className="text-center py-20">
        <AlertCircle className="mx-auto mb-3 text-gray-400" />
        {message}
    </div>
);

export default OrderProcessing;
