import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/cartContext';
import { useAuth } from '@/context/authContext';
import axios from 'axios';
import { createOrder, getAddress } from '@/services/order/order.api';
import { toast } from 'react-toastify';
import discountService from '@/services/discount/discount.api';
import DiscountInput from '@/components/Discount/DiscountInput';
import { useLocation } from 'react-router-dom';

const safeParseJson = (value) => {
    try {
        return value ? JSON.parse(value) : null;
    } catch {
        return null;
    }
};

const CheckoutPage = () => {
    const { cart, removeMultipleItems } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Ưu tiên dữ liệu Build PC từ navigate state, fallback localStorage
    const [buildPcData] = useState(() => {
        const fromState = location.state?.buildPcCheckout || null;
        if (fromState?.isBuildPc && Array.isArray(fromState.items) && fromState.items.length > 0) {
            return fromState;
        }

        const fromStorage = safeParseJson(localStorage.getItem('buildpc_checkout'));
        if (fromStorage?.isBuildPc && Array.isArray(fromStorage.items) && fromStorage.items.length > 0) {
            return fromStorage;
        }

        const fromLegacyStorage = safeParseJson(localStorage.getItem('buipc_checkout'));
        if (fromLegacyStorage?.isBuildPc && Array.isArray(fromLegacyStorage.items) && fromLegacyStorage.items.length > 0) {
            return fromLegacyStorage;
        }

        return null;
    });

    useEffect(() => {
        return () => {
            // Rời khỏi checkout khi chưa hoàn tất thanh toán thì dọn dữ liệu Build PC tạm
            localStorage.removeItem('buildpc_checkout');
            localStorage.removeItem('buipc_checkout');
        };
    }, []);

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        street: '',
        province: '',
        ward: '',
        note: '',
        discountCode: '',
        paymentMethod: 'COD',
    });

    const buyNowItem = location.state?.buyNowItem || null;
    const isBuildPcNavigation = !!location.state?.buildPcCheckout;
    const isBuyNow = !!buyNowItem && !isBuildPcNavigation;
    const isBuildPc = !!(buildPcData?.isBuildPc && Array.isArray(buildPcData?.items) && buildPcData.items.length > 0);
    const fromCart = !isBuildPc ? (location.state?.fromCart || false) : false;
    const [discountInfo, setDiscountInfo] = useState(null);
    const [discountError, setDiscountError] = useState(null);
    const [availableDiscounts, setAvailableDiscounts] = useState([]);
    const [loadingDiscounts, setLoadingDiscounts] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fetchingLocation, setFetchingLocation] = useState(false);
    const [isDiscountListOpen, setIsDiscountListOpen] = useState(false);
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!user) return <Navigate to="/login" replace />;
    if (!isBuyNow && !isBuildPc && !cart?.items?.length) {
        return <Navigate to="/cart" replace />;
    }
    const selectedItems = isBuildPc
        ? (buildPcData?.items || [])
        : isBuyNow
          ? [buyNowItem]
          : location.state?.selectedItems || cart?.items || [];

    const subtotal = selectedItems.reduce((sum, item) => sum + item.priceSnapshot * item.quantity, 0);
    const shippingFee = 0;

    // Tính discountAmount dựa trên discountInfo (nếu đã apply)
    const discountAmount = discountInfo
        ? Math.min(
              discountInfo.discountType === 'percent' ? subtotal * (discountInfo.value / 100) : discountInfo.value,
              discountInfo.maxDiscountValue || Infinity,
          )
        : 0;

    const total = subtotal - discountAmount + shippingFee;

    // Fetch danh sách mã giảm giá khả dụng
    useEffect(() => {
        const fetchDiscounts = async () => {
            setLoadingDiscounts(true);
            try {
                const res = await discountService.getAvailableDiscounts({ orderValue: subtotal });

                let discounts = [];

                // Trường hợp 1: backend trả array trực tiếp (như hiện tại)
                if (Array.isArray(res.data)) {
                    discounts = res.data;
                }
                // Trường hợp 2: backend trả object { success: true, data: [...] }
                else if (res.data?.success && Array.isArray(res.data.data)) {
                    discounts = res.data.data;
                }
                // Trường hợp fallback: nếu có count nhưng data là array
                else if (res.data?.count && Array.isArray(res.data.data)) {
                    discounts = res.data.data;
                }

                setAvailableDiscounts(discounts);
                console.log('Đã set availableDiscounts với length:', discounts.length);
            } catch (err) {
                console.warn('Lỗi fetch discounts:', err);
            } finally {
                setLoadingDiscounts(false);
            }
        };

        if (subtotal > 0) {
            fetchDiscounts();
        }
    }, [subtotal]);

    useEffect(() => {
        if (user) {
            setFormData((prev) => ({
                ...prev,
                fullName: user.userName || '',
                phone: user.phone || '',
                email: user.email || '',
                street: user.address?.street || '',
                province: user.address?.province || '',
                ward: user.address?.ward || '',
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Trình duyệt không hỗ trợ lấy vị trí');
            return;
        }

        setFetchingLocation(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                try {
                    const data = await getAddress({
                        lat: coords.latitude,
                        lon: coords.longitude,
                    });

                    setFormData((prev) => ({
                        ...prev,
                        street: data.street || prev.street || '',
                        province: data.province || prev.province || '',
                        ward: data.ward || prev.ward || '',
                        note: (prev.note ? prev.note + '\n' : '') + '(Lấy từ vị trí hiện tại)',
                    }));

                    toast.success('Lấy địa chỉ hiện tại thành công!', {
                        position: 'top-right',
                        autoClose: 4000,
                    });
                } catch (err) {
                    console.error('Lỗi khi lấy địa chỉ tự động:', err);
                    setError('Không thể lấy địa chỉ tự động. Vui lòng nhập thủ công.');
                    toast.error('Không thể lấy địa chỉ tự động.');
                } finally {
                    setFetchingLocation(false);
                }
            },
            (err) => {
                setFetchingLocation(false);
                const msg =
                    err.code === 1
                        ? 'Bạn đã từ chối chia sẻ vị trí.'
                        : 'Lỗi lấy vị trí. Vui lòng kiểm tra quyền truy cập.';
                toast.error(msg);
            },
            { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 },
        );
    };
    const handleRemoveDiscount = () => {
        setDiscountInfo(null);
        setDiscountError(null);
        setFormData((prev) => ({ ...prev, discountCode: '' }));
        toast.info('Đã bỏ mã giảm giá');
    };

    const applyDiscount = async () => {
        const code = formData.discountCode?.trim().toUpperCase();
        if (!code) {
            setDiscountError('Vui lòng nhập mã giảm giá');
            toast.warn('Vui lòng nhập mã giảm giá');
            return;
        }

        setLoading(true);
        setDiscountError(null);
        setDiscountInfo(null);

        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:9999';

        try {
            const response = await axios.post(
                `${apiBase}/api/discounts/check`,
                { code, orderValue: subtotal },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                },
            );

            if (response.data.success) {
                const discData = response.data.data;
                let appliedAmount = discData.calculatedDiscount;

                if (appliedAmount === undefined) {
                    let calc = 0;
                    if (discData.discountType === 'percent') {
                        calc = subtotal * (discData.value / 100);
                    } else if (discData.discountType === 'fixed') {
                        calc = discData.value;
                    }
                    appliedAmount = Math.min(calc, discData.maxDiscountValue || calc);
                }

                setDiscountInfo({
                    ...discData,
                    calculatedDiscount: appliedAmount,
                });

                toast.success(`Áp dụng thành công! Giảm ${appliedAmount.toLocaleString('vi-VN')}đ`);
            } else {
                setDiscountError(response.data.message || 'Không áp dụng được mã này');
                toast.error(response.data.message || 'Không áp dụng được mã này');
            }
        } catch (err) {
            let msg = 'Mã giảm giá không hợp lệ hoặc đã hết hạn';
            if (err.response) {
                msg = err.response.data?.message || msg;
            } else if (err.request) {
                msg = 'Không kết nối được đến server. Vui lòng kiểm tra mạng.';
            }

            setDiscountError(msg);
            toast.error(msg);
            setDiscountInfo(null);
            console.error('Lỗi apply discount:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;
        if (!phoneRegex.test(formData.phone)) {
            toast.error('Số điện thoại không hợp lệ');
            return;
        }
        if (formData.email && !emailRegex.test(formData.email)) {
            toast.error('Email không hợp lệ');
            return;
        }
        setLoading(true);
        setError(null);

        const shippingAddress = {
            fullName: formData.fullName,
            phone: formData.phone,
            email: formData.email,
            street: formData.street,
            ward: formData.ward,
            province: formData.province,
            note: formData.note,
        };

        const payload = {
            shippingAddress,
            paymentMethod: formData.paymentMethod,
            discountCode: formData.discountCode?.trim() || undefined,
            items: selectedItems.map((item) => ({
                productId: item.productId?._id || item.productId,
                productType: item.productType || item.productId?.productType,
                quantity: item.quantity,
                priceSnapshot: item.priceSnapshot,
                nameSnapshot: item.nameSnapshot,
                imageSnapshot: item.imageSnapshot,
            })),
        };

        try {
            const res = await createOrder(payload);
            console.log('Payload: ', res);
            const orderId = res?.order?._id;
            console.log('OrderId: ', orderId);
            if (formData.paymentMethod === 'MOMOPAY') {
                const payUrl = res?.paymentUrl;

                if (!payUrl) {
                    throw new Error('Backend không trả về paymentUrl');
                }

                // KHÔNG xóa cart ở đây
                window.location.href = payUrl;
                return;
            }

            // COD PAYMENT
            toast.success('Đặt hàng thành công!', {
                position: 'top-right',
                autoClose: 4000,
            });

            if (isBuildPc) {
                localStorage.removeItem('buildpc_checkout');
                localStorage.removeItem('buipc_checkout');
            }
           if (fromCart) {
               const itemsToRemove = selectedItems.map((i) => ({
                   productId: i.productId?._id || i.productId,
                   productType: i.productType || i.productId?.productType,
               }));
               await removeMultipleItems(itemsToRemove);
           }

            navigate('/order-success', {
                state: { orderId },
            });
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Đặt hàng thất bại! Vui lòng thử lại.';

            setError(msg);
            toast.error(msg);
            console.error('Lỗi đặt hàng:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <h1 className="text-3xl font-bold mb-8 text-center md:text-left">
                {buildPcData ? 'Thanh toán cấu hình PC' : 'Cổng thanh toán'}
            </h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold">Thông tin vận chuyển</h2>
                            <button
                                type="button"
                                onClick={getCurrentLocation}
                                disabled={fetchingLocation}
                                className={`flex items-center gap-2 px-4 py-2 border border-blue-400 rounded-lg font-medium transition ${
                                    fetchingLocation ? 'bg-gray-400 cursor-not-allowed' : 'bg-white hover:bg-blue-200'
                                }`}
                            >
                                {fetchingLocation ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                fill="none"
                                            />
                                        </svg>
                                        Đang lấy...
                                    </>
                                ) : (
                                    <>📍 Lấy địa chỉ hiện tại</>
                                )}
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Họ và Tên <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Số điện thoại <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 
                                        ${
                                            !phoneRegex.test(formData.phone) && formData.phone
                                                ? 'border-red-500'
                                                : 'border-gray-300'
                                        }`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Địa chỉ chi tiết <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="street"
                                    placeholder="Số nhà, tên đường, ngõ..."
                                    value={formData.street}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Tỉnh/Thành phố <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="province"
                                        value={formData.province}
                                        onChange={handleChange}
                                        placeholder="Ví dụ: Hà Nội, TP. Hồ Chí Minh"
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Xã/Phường <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="ward"
                                        value={formData.ward}
                                        onChange={handleChange}
                                        placeholder="Ví dụ: Phường Cầu Giấy, Xã Đông Xuân"
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Ghi chú</label>
                                <textarea
                                    name="note"
                                    value={formData.note}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Hướng dẫn giao hàng, ghi chú đặc biệt..."
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                                <strong>Thông tin giao hàng:</strong> Giao tiêu chuẩn mất 2-3 ngày làm việc đối với
                                TP.HCM và 3-5 ngày đối với các tỉnh. Dịch vụ giao nhanh cho một số khu vực nội thành.
                            </div>

                            {error && <p className="text-red-600 bg-red-50 p-3 rounded-lg mt-4 text-center">{error}</p>}
                        </form>
                    </div>
                </div>

                {/* RIGHT: Tóm tắt thanh toán */}
                <div className="lg:col-span-1">
                    <div
                        className="rounded-xl shadow-xl p-6 sticky top-8"
                        style={{
                            background: 'linear-gradient(180deg, #5DB7FF 0%, #2F8FFF 55%, #0B6FD6 100%)',
                        }}
                    >
                        <h3 className="text-2xl text-center font-bold mb-8 text-white">Tóm tắt thanh toán</h3>

                        {/* Mã giảm giá */}
                        <DiscountInput
                            discountCode={formData.discountCode}
                            setDiscountCode={(value) => setFormData((prev) => ({ ...prev, discountCode: value }))}
                            discountInfo={discountInfo}
                            setDiscountInfo={setDiscountInfo}
                            discountError={discountError}
                            setDiscountError={setDiscountError}
                            subtotal={subtotal}
                            loading={loading}
                            applyDiscount={applyDiscount}
                            removeDiscount={handleRemoveDiscount}
                            availableDiscounts={availableDiscounts}
                            loadingDiscounts={loadingDiscounts}
                            isDiscountListOpen={isDiscountListOpen}
                            setIsDiscountListOpen={setIsDiscountListOpen}
                            discountAmount={discountAmount}
                        />

                        {/* Danh sách sản phẩm */}
                        <div className="space-y-4 mb-6">
                            {selectedItems.map((item) => (
                                <div key={item.productId} className="flex items-center gap-3">
                                    <img
                                        src={item.imageSnapshot || '/placeholder.jpg'}
                                        alt={item.nameSnapshot}
                                        className="w-16 h-16 object-cover rounded bg-white"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 line-clamp-2">{item.nameSnapshot}</p>
                                        <p className="text-sm text-gray-700">
                                            {item.category ? `${item.category.toUpperCase()} x` : 'x'}
                                            {item.quantity}
                                        </p>
                                    </div>
                                    <p className="font-bold text-black">
                                        {(item.priceSnapshot * item.quantity).toLocaleString('vi-VN')}đ
                                    </p>
                                </div>
                            ))}
                        </div>

                        <hr className="border-gray-300/50 my-6" />

                        <div className="space-y-3 mb-8 text-gray-900">
                            <div className="flex justify-between">
                                <span>Giá trị sản phẩm</span>
                                <span className="font-semibold text-black">{subtotal.toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Phí vận chuyển</span>
                                <span>
                                    {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')}đ`}
                                </span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-blue-900">
                                    <span>Giảm giá({formData.discountCode})</span>
                                    <span>-{discountAmount.toLocaleString('vi-VN')}đ</span>
                                </div>
                            )}
                            <div className="flex justify-between text-2xl font-bold pt-4 border-t border-gray-300/50">
                                <span className="text-gray-900">Tổng cộng</span>
                                <span className="">{total.toLocaleString('vi-VN')}đ</span>
                            </div>
                        </div>

                        {/* Phương thức thanh toán */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900">Phương thức thanh toán</h3>
                            <div className="space-y-4">
                                <label className="flex items-center bg-white/80 p-4 rounded-lg cursor-pointer hover:bg-white transition text-gray-900">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="MOMOPAY"
                                        checked={formData.paymentMethod === 'MOMOPAY'}
                                        onChange={handleChange}
                                        className="mr-3 h-5 w-5 text-blue-600 accent-blue-600"
                                    />
                                    <span className="font-medium">Thanh toán ngay (MoMo Pay)</span>
                                </label>

                                <label className="flex items-center bg-white/80 p-4 rounded-lg cursor-pointer hover:bg-white transition text-gray-900">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="COD"
                                        checked={formData.paymentMethod === 'COD'}
                                        onChange={handleChange}
                                        className="mr-3 h-5 w-5 text-blue-600 accent-blue-600"
                                    />
                                    <span className="font-medium">Thanh toán khi nhận hàng (COD)</span>
                                </label>
                            </div>
                        </div>

                        {/* Nút Mua ngay */}
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`w-full py-5 rounded-xl font-bold text-xl transition shadow-lg ${
                                loading
                                    ? 'bg-gray-400 cursor-not-allowed text-white'
                                    : 'bg-white text-blue-700 hover:bg-blue-50'
                            }`}
                        >
                            {loading ? 'Đang xử lý...' : 'Mua ngay'}
                        </button>

                        {error && <p className="text-red-600 bg-red-100 p-3 rounded-lg mt-4 text-center">{error}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
