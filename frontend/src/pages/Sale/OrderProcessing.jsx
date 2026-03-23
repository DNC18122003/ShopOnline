import React, { useEffect, useState } from 'react';
import {
    Package,
    Bell,
    Eye,
    Truck,
    CheckCircle,
    XCircle,
    Clock,
    Phone,
    User as UserIcon,
    AlertCircle,
} from 'lucide-react';
import { getPendingAssignments, acceptOrder, rejectOrder, getMyProcessingOrders } from '@/services/SaleDashboard/sale.api';
import { updateOrderStatus } from '@/services/order/order.api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import StatusDropdown from '../../components/ui/StatusDropdown';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

// Luồng trạng thái rút gọn cho Sale (Bỏ qua pending/confirmed vì đã xử lý khi Accept)
const saleStatusFlow = {
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
const OrderProcessing = () => {
    const [activeTab, setActiveTab] = useState('pending'); // Mặc định mở đơn mới để Sale chú ý
    const [processingOrders, setProcessingOrders] = useState([]);
    const [pendingAssignments, setPendingAssignments] = useState([]);
    const [loading, setLoading] = useState(false);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
        const timer = setInterval(fetchData, 30000); // Tự động làm mới mỗi 30s
        return () => clearInterval(timer);
    }, [activeTab]);

   const fetchData = async () => {
       try {
           setLoading(true);

           if (activeTab === 'pending') {
               const res = await getPendingAssignments();
               setPendingAssignments(res || []);
           } else {
               const res = await getMyProcessingOrders();
               setProcessingOrders(res || []);
           }
       } catch (error) {
           console.error('Lỗi tải dữ liệu:', error);
       } finally {
           setLoading(false);
       }
   };
    const handleAction = async (actionFn, orderId, successMsg) => {
        try {
            setLoading(true);
            await actionFn(orderId);
            toast.success(successMsg);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Thao tác thất bại');
        } finally {
            setLoading(false);
        }
    };

    const confirmUpdateStatus = async () => {
        try {
            await updateOrderStatus(selectedOrder, selectedStatus);
            toast.success(`Đã chuyển đơn sang: ${selectedStatus}`);
            setConfirmOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Không thể cập nhật trạng thái');
        }
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800"> Xử lý đơn hàng</h1>
                <div className="text-sm text-slate-500 flex items-center gap-2">
                    <Clock size={16} /> Tự động cập nhật sau 30s
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex bg-white p-1 rounded-lg shadow-sm border w-fit">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all ${
                        activeTab === 'pending'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                    <Bell size={18} className={pendingAssignments.length > 0 ? 'animate-pulse' : ''} />
                    Đơn mới gán
                    {pendingAssignments.length > 0 && (
                        <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                            {pendingAssignments.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('processing')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all ${
                        activeTab === 'processing'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                    <Package size={18} />
                    Đang phụ trách
                </button>
            </div>

            {/* Content Area */}
            <div className="grid gap-4">
                {activeTab === 'pending' ? (
                    // VIEW: ĐƠN HÀNG CHỜ NHẬN
                    pendingAssignments.length > 0 ? (
                        pendingAssignments.map((item) => (
                            <div
                                key={item._id}
                                className="bg-white border-l-4 border-yellow-400 p-5 rounded-xl shadow-sm flex items-center justify-between animate-in fade-in slide-in-from-left-4"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-lg text-blue-700">
                                            #{item.orderId?.orderCode?.slice(0, 8)}
                                        </span>
                                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                                            Gán lúc: {new Date(item.assignedAt).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-slate-600 text-sm">
                                        <span className="flex items-center gap-1">
                                            <UserIcon size={14} /> {item.orderId?.shippingAddress?.fullName}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Phone size={14} /> {item.orderId?.shippingAddress?.phone}
                                        </span>
                                        <span className="font-semibold text-slate-800">
                                            {(item.orderId?.finalAmount || 0).toLocaleString()}đ
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() =>
                                            handleAction(acceptOrder, item.orderId?._id, 'Đã tiếp nhận đơn hàng')
                                        }
                                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        <CheckCircle size={18} /> Chấp nhận
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleAction(rejectOrder, item.orderId?._id, 'Đã từ chối đơn hàng')
                                        }
                                        className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        <XCircle size={18} /> Từ chối
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <EmptyState message="Hiện chưa có đơn hàng nào được gán cho bạn." />
                    )
                ) : (
                    // VIEW: ĐƠN HÀNG ĐANG XỬ LÝ
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b text-slate-600 text-sm font-medium">
                                <tr>
                                    <th className="p-4">Đơn hàng</th>
                                    <th>Khách hàng</th>
                                    <th>Thanh toán</th>
                                    <th>Trạng thái hiện tại</th>
                                    <th className="text-center">Cập nhật nhanh</th>
                                    <th className="text-right p-4">Chi tiết</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {processingOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-slate-800">
                                                #{order.orderCode?.slice(0, 8)}
                                            </div>
                                            <div className="text-[10px] text-slate-400">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="text-sm font-medium text-slate-700">
                                                {order.shippingAddress?.fullName}
                                            </div>
                                            <div className="text-xs text-slate-500">{order.shippingAddress?.phone}</div>
                                        </td>
                                        <td>
                                            <span
                                                className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${
                                                    order.paymentStatus === 'paid'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                }`}
                                            >
                                                {paymentStatusLabel[order.paymentStatus] || order.paymentStatus}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2 text-sm text-slate-600 uppercase font-semibold italic">
                                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                                {orderStatusLabel[order.orderStatus] || order.orderStatus}
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <div className="inline-block scale-90">
                                                <StatusDropdown
                                                    order={order}
                                                    statusFlow={saleStatusFlow}
                                                    onChange={(id, status) => {
                                                        setSelectedOrder(id);
                                                        setSelectedStatus(status);
                                                        setConfirmOpen(true);
                                                    }}
                                                />
                                            </div>
                                        </td>
                                        <td className="text-right p-4">
                                            <button
                                                onClick={() => navigate(`/sale/orders/${order._id}`)}
                                                className="p-2 hover:bg-blue-50 text-blue-600 rounded-full transition-colors"
                                            >
                                                <Eye size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {processingOrders.length === 0 && (
                            <EmptyState message="Bạn không có đơn hàng nào đang xử lý." />
                        )}
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={confirmOpen}
                setOpen={setConfirmOpen}
                title="Cập nhật tiến độ đơn hàng"
                message={`Xác nhận chuyển đơn sang trạng thái "${orderStatusLabel[selectedStatus]}"? Hành động này sẽ thông báo tới khách hàng.`}
                onConfirm={confirmUpdateStatus}
            />
        </div>
    );
};

const EmptyState = ({ message }) => (
    <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-slate-300" size={32} />
        </div>
        <p className="text-slate-500 font-medium">{message}</p>
    </div>
);

export default OrderProcessing;
