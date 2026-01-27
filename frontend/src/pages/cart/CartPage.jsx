import React from 'react';
import { useCart } from '../../context/cartContext';
import CartItem from '../../components/layouts/customer/CartItem';

const CartPage = () => {
    const { cart, loading, removeItem, updateQuantity, clearCart } = useCart();
    const cartContext = useCart();
    console.log("Check:",cartContext);

    if (loading) {
        return <div className="py-16 text-center text-gray-500">Đang tải giỏ hàng...</div>;
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-semibold mb-4">Giỏ hàng trống 🛒</h2>
                <p className="text-gray-500 mb-6">Hãy thêm sản phẩm để tiếp tục mua sắm</p>
                <button className="text-blue-600 hover:underline">← Tiếp tục mua sắm</button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Giỏ hàng</h1>
                <p className="text-gray-600">Xem lại sản phẩm trước khi thanh toán</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT: Cart items */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold">Sản phẩm ({cart.totalQuantity})</h2>
                            <button onClick={clearCart} className="text-red-600 hover:underline text-sm">
                                🗑️ Xóa tất cả
                            </button>
                        </div>

                        <div className="space-y-4">
                            
                            {cart.items.map((item) => (
                                <CartItem
                                    key={String(item.productId)}
                                    item={item}
                                    onRemove={() => removeItem(item.productId)}
                                    onUpdateQuantity={(qty) => updateQuantity(item.productId, qty)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow p-6 sticky top-24">
                        <h3 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h3>

                        <div className="flex justify-between mb-2 text-gray-600">
                            <span>Tổng sản phẩm</span>
                            <span>{cart.totalQuantity}</span>
                        </div>

                        <div className="flex justify-between mb-4 text-gray-600">
                            <span>Tạm tính</span>
                            <span>{cart.totalPrice.toLocaleString('vi-VN')} ₫</span>
                        </div>

                        <hr className="mb-4" />

                        <div className="flex justify-between font-semibold text-lg mb-6">
                            <span>Tổng cộng</span>
                            <span className="text-red-600">{cart.totalPrice.toLocaleString('vi-VN')} ₫</span>
                        </div>

                        <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">
                            Tiến hành thanh toán
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <button className="text-blue-600 hover:underline">← Tiếp tục mua sắm</button>
            </div>
        </div>
    );
};

export default CartPage;
