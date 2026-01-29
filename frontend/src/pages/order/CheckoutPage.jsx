import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/cartContext';
import { useAuth } from '@/context/authContext';
import axios from 'axios';

const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    street: '',
    province: '',
    district: '',
    ward: '',
    note: '',
    discountCode: '',
    paymentMethod: 'COD',
  });

  const [discountApplied, setDiscountApplied] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!user) return <Navigate to="/login" replace />;
  if (!cart || cart.items.length === 0) return <Navigate to="/cart" replace />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const applyDiscount = () => {
    if (formData.discountCode.toUpperCase() === 'GIAM10') {
      setDiscountApplied(10);
    } else {
      alert('Mã giảm giá không hợp lệ!');
    }
  };

  const subtotal = cart.totalPrice;
  const shippingFee = 0;
  const discountAmount = (subtotal * discountApplied) / 100;
  const total = subtotal - discountAmount + shippingFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const shippingAddress = {
      fullName: formData.fullName,
      phone: formData.phone,
      street: formData.street,
      ward: formData.ward,
      province: `${formData.province} - ${formData.district}`,
      note: formData.note,
    };

    const payload = {
      shippingAddress,
      paymentMethod: formData.paymentMethod,
      discountCode: formData.discountCode || undefined,
      discountAmount,
    };

    try {
      const res = await axios.post('/api/order/create', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      clearCart();
      navigate(`/order-success?orderId=${res.data.order._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Đặt hàng thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
          <h1 className="text-3xl font-bold mb-8 text-center md:text-left">Thanh toán</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* LEFT: Thông tin vận chuyển */}
              <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                      <h2 className="text-2xl font-semibold mb-6">Thông tin vận chuyển</h2>

                      <form onSubmit={handleSubmit} className="space-y-5">
                          {/* Các input giữ nguyên */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              <div>
                                  <label className="block text-sm font-medium mb-1">Họ và Tên *</label>
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
                                  <label className="block text-sm font-medium mb-1">Số điện thoại *</label>
                                  <input
                                      type="tel"
                                      name="phone"
                                      value={formData.phone}
                                      onChange={handleChange}
                                      required
                                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                              <label className="block text-sm font-medium mb-1">Địa chỉ nhà *</label>
                              <input
                                  type="text"
                                  name="street"
                                  placeholder="Số nhà, tên đường..."
                                  value={formData.street}
                                  onChange={handleChange}
                                  required
                                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                              <div>
                                  <label className="block text-sm font-medium mb-1">Tỉnh/Thành phố *</label>
                                  <select
                                      name="province"
                                      value={formData.province}
                                      onChange={handleChange}
                                      required
                                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                      <option value="">Chọn tỉnh/thành</option>
                                      <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                                      <option value="Hà Nội">Hà Nội</option>
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-sm font-medium mb-1">Quận/Huyện *</label>
                                  <select
                                      name="district"
                                      value={formData.district}
                                      onChange={handleChange}
                                      required
                                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                      <option value="">Chọn quận/huyện</option>
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-sm font-medium mb-1">Phường/Xã *</label>
                                  <select
                                      name="ward"
                                      value={formData.ward}
                                      onChange={handleChange}
                                      required
                                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                      <option value="">Chọn phường/xã</option>
                                  </select>
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
                              <strong>Thông tin giao hàng:</strong> Giao tiêu chuẩn mất 2-3 ngày làm việc đối với TP.HCM
                              và 3-5 ngày đối với các tỉnh. Dịch vụ giao nhanh cho một số khu vực nội thành.
                          </div>
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
                      <div className="mb-6">
                          <label className="block text-sm mb-2 text-white">Mã giảm giá</label>
                          <div className="flex">
                              <input
                                  type="text"
                                  name="discountCode"
                                  value={formData.discountCode}
                                  onChange={handleChange}
                                  placeholder="Nhập mã giảm giá"
                                  className="flex-1 px-4 py-3 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <button
                                  type="button"
                                  onClick={applyDiscount}
                                  className="bg-white px-6 py-3 text-blue-600 font-medium rounded-r-lg hover:bg-blue-50 transition"
                              >
                                  Áp dụng
                              </button>
                          </div>
                          {discountApplied > 0 && (
                              <p className="text-sm mt-2 text-black">Đã giảm {discountApplied}%!</p>
                          )}
                      </div>

                      {/* Danh sách sản phẩm */}
                      <div className="space-y-4 mb-6">
                          {cart.items.map((item) => (
                              <div key={item.productId} className="flex items-center gap-3">
                                  <img
                                      src={item.imageSnapshot || '/placeholder.jpg'}
                                      alt={item.nameSnapshot}
                                      className="w-16 h-16 object-cover rounded bg-white"
                                  />
                                  <div className="flex-1">
                                      <p className="font-medium text-gray-900">{item.nameSnapshot}</p>
                                      <p className="text-sm text-gray-700">x{item.quantity}</p>
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
                              <span>{shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')}đ`}</span>
                          </div>
                          {discountAmount > 0 && (
                              <div className="flex justify-between text-blue-900">
                                  <span>Giảm giá</span>
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