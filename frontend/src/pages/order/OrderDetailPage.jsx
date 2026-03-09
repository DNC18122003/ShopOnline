import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, MapPin, CreditCard, CheckCircle, Truck, Phone, Mail, Notebook, Clock } from 'lucide-react';

import { getOrderDetail } from '@/services/order/order.api';

const Card = ({ children }) => <div className="bg-white rounded-xl shadow-sm border p-5">{children}</div>;

const ORDER_STEPS = ['pending', 'confirmed', 'shipping', 'completed'];

const STEP_CONFIG = {
    pending: {
        label: 'Chờ xử lý',
        icon: Clock,
    },
    confirmed: {
        label: 'Đã xác nhận',
        icon: CheckCircle,
    },
    shipping: {
        label: 'Đang giao',
        icon: Truck,
    },
    completed: {
        label: 'Hoàn thành',
        icon: CheckCircle,
    },
};

const OrderDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrderDetail = async () => {
            try {
                setLoading(true);
                const res = await getOrderDetail(id);
                setOrder(res);
            } catch (err) {
                setError('Không thể tải chi tiết đơn hàng');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchOrderDetail();
    }, [id]);

    /* format date VN */
    const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleString('vi-VN');
    };

    /* lấy thời gian của từng step */
    const getStepTime = (status) => {
        const log = order?.statusLogs?.find((l) => l.status === status);
        return log?.updatedAt;
    };

    if (loading) return <div className="p-6">Đang tải...</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;
    if (!order) return null;

    return (
        <div className="bg-gray-50 min-h-screen p-6">
            <div className="max-w-6xl mx-auto">
                <button onClick={() => navigate(-1)} className="mb-6 text-blue-600 hover:underline">
                    ← Quay lại
                </button>

                <h1 className="text-2xl font-bold mb-6">Đơn hàng #{order.orderCode}</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Products */}
                        <Card>
                            <h2 className="font-semibold mb-4">Sản phẩm đã đặt</h2>

                            {order.items?.map((item, index) => (
                                <div
                                    key={`${item.productId}-${index}`}
                                    className="flex justify-between items-center border-b py-4 last:border-none"
                                >
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={item.imageSnapshot}
                                            alt=""
                                            className="w-16 h-16 object-cover rounded-lg border"
                                        />

                                        <div>
                                            <p className="font-medium">{item.nameSnapshot}</p>
                                            <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                                        </div>
                                    </div>

                                    <p className="text-blue-600 font-semibold">
                                        {item.priceSnapshot?.toLocaleString()}đ
                                    </p>
                                </div>
                            ))}
                        </Card>

                        {/* Summary */}
                        <Card>
                            <h2 className="font-semibold mb-4">Tổng kết đơn hàng</h2>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Tạm tính</span>
                                    <span>{order.subtotal?.toLocaleString()}đ</span>
                                </div>

                                {order.discountAmount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Giảm giá ({order.discountCode})</span>
                                        <span>-{order.discountAmount?.toLocaleString()}đ</span>
                                    </div>
                                )}

                                <div className="flex justify-between font-bold text-blue-600 pt-3 border-t">
                                    <span>Tổng cộng</span>
                                    <span>{order.finalAmount?.toLocaleString()}đ</span>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* RIGHT */}
                    <div className="space-y-6">
                        {/* Customer */}
                        <Card>
                            <h2 className="font-semibold mb-4">Thông tin khách hàng</h2>

                            <div className="space-y-3">
                                <div className="flex text-sm gap-4">
                                    <User size={16} />
                                    <p>{order.shippingAddress?.fullName}</p>
                                </div>

                                <div className="flex text-sm gap-4">
                                    <Phone size={16} />
                                    <p>{order.shippingAddress?.phone}</p>
                                </div>

                                <div className="flex text-sm gap-4">
                                    <Mail size={16} />
                                    <p>{order.shippingAddress?.email || 'Không có'}</p>
                                </div>

                                <div className="flex text-sm gap-4">
                                    <Notebook size={16} />
                                    <p>{order.shippingAddress?.note || 'Không có'}</p>
                                </div>
                            </div>
                        </Card>

                        {/* Address */}
                        <Card>
                            <h2 className="font-semibold mb-4">Địa chỉ giao hàng</h2>

                            <div className="flex gap-3">
                                <MapPin size={18} className="text-gray-500 mt-1" />

                                <div className="text-sm">
                                    <p>{order.shippingAddress?.street}</p>
                                    <p>{order.shippingAddress?.ward}</p>
                                    <p>{order.shippingAddress?.province}</p>
                                </div>
                            </div>
                        </Card>

                        {/* Payment */}
                        <Card>
                            <h2 className="font-semibold mb-4">Thanh toán</h2>

                            <div className="flex gap-3">
                                <CreditCard size={18} className="text-gray-500 mt-1" />

                                <div className="text-sm">
                                    <p>{order.paymentMethod}</p>

                                    <p
                                        className={`font-medium ${
                                            order.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-500'
                                        }`}
                                    >
                                        {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* STATUS TIMELINE */}

                <div className="pt-10">
                    <Card>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-semibold">Trạng thái đơn hàng</h2>

                            <span
                                className={`px-3 py-1 text-xs rounded-full font-medium ${
                                    order.orderStatus === 'pending'
                                        ? 'bg-yellow-100 text-yellow-600'
                                        : order.orderStatus === 'confirmed'
                                        ? 'bg-teal-100 text-teal-600'
                                        : order.orderStatus === 'shipping'
                                        ? 'bg-blue-100 text-blue-600'
                                        : order.orderStatus === 'completed'
                                        ? 'bg-green-100 text-green-600'
                                        : 'bg-red-100 text-red-600'
                                }`}
                            >
                                {STEP_CONFIG[order.orderStatus]?.label || 'Đã huỷ'}
                            </span>
                        </div>

                        {order.orderStatus !== 'cancelled' ? (
                            <div className="flex items-center justify-between relative">
                                {ORDER_STEPS.map((step, index) => {
                                    const currentIndex = ORDER_STEPS.indexOf(order.orderStatus);

                                    const isActive = index <= currentIndex;

                                    const Icon = STEP_CONFIG[step].icon;

                                    const stepTime = getStepTime(step);

                                    return (
                                        <div key={step} className="flex-1 flex flex-col items-center relative">
                                            {index !== 0 && (
                                                <div
                                                    className={`absolute top-5 left-[-50%] w-full h-1 ${
                                                        index <= currentIndex ? 'bg-green-500' : 'bg-gray-300'
                                                    }`}
                                                />
                                            )}

                                            <div
                                                className={`z-10 w-10 h-10 flex items-center justify-center rounded-full border-2 transition ${
                                                    isActive
                                                        ? 'bg-green-500 border-green-500 text-white'
                                                        : 'bg-white border-gray-300 text-gray-400'
                                                }`}
                                            >
                                                <Icon size={18} />
                                            </div>

                                            <p className="text-sm mt-2 font-medium">{STEP_CONFIG[step].label}</p>

                                            {stepTime && (
                                                <p className="text-xs text-gray-500">{formatDate(stepTime)}</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-red-500 font-medium">Đơn hàng đã bị huỷ</div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;
