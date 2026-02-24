// src/pages/cart/CartPage.jsx
import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/cartContext';
import { useAuth } from '@/context/authContext';
import CartItem from '@/components/customer/CartItem';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

const CartPage = () => {
    const user = localStorage.getItem('data_ui');
    const { cart, loading, removeItem, updateQuantity, clearCart } = useCart();
    const navigate = useNavigate();

    // Lưu các productId được chọn
    const [selectedIds, setSelectedIds] = useState([]);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (loading) {
        return <div className="py-16 text-center text-gray-500">Đang tải giỏ hàng...</div>;
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-semibold mb-4">Giỏ hàng trống 🛒</h2>
                <p className="text-gray-500 mb-6">Hãy thêm sản phẩm để tiếp tục mua sắm</p>
                <Link to="/product">
                    <button className="text-blue-600 hover:underline">← Tiếp tục mua sắm</button>
                </Link>
            </div>
        );
    }

    // Tính toán các giá trị cho phần đã chọn
    const selectedItems = cart.items.filter((item) => selectedIds.includes(item.productId));

    const selectedQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
    const selectedTotal = selectedItems.reduce((sum, item) => sum + item.priceSnapshot * item.quantity, 0);

    const allSelected = selectedIds.length === cart.items.length;
    const someSelected = selectedIds.length > 0 && selectedIds.length < cart.items.length;

    const toggleSelect = (productId) => {
        setSelectedIds((prev) =>
            prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
        );
    };

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(cart.items.map((item) => item.productId));
        }
    };

    const handleCheckoutSelected = () => {
        if (selectedItems.length === 0) return;

        // Cách 1: truyền qua state (khuyên dùng)
        navigate('/checkout', {
            state: {
                selectedItems,
                total: selectedTotal,
                fromCart: true,
            },
        });

       
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Giỏ hàng</h1>
                <p className="text-gray-600">Xem lại sản phẩm trước khi thanh toán</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT: Cart items */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    checked={allSelected}
                                    indeterminate={someSelected}
                                    onCheckedChange={toggleSelectAll}
                                />
                                <h2 className="text-xl font-semibold">Sản phẩm ({cart.totalQuantity})</h2>
                            </div>

                            <button
                                onClick={clearCart}
                                className="text-red-600 hover:underline text-sm self-end sm:self-auto"
                            >
                                🗑️ Xóa tất cả
                            </button>
                        </div>

                        <div className="space-y-4">
                            {cart.items.map((item) => (
                                <CartItem
                                    key={String(item.productId)}
                                    item={item}
                                    onRemove={removeItem}
                                    onUpdateQuantity={updateQuantity}
                                    isSelected={selectedIds.includes(item.productId)}
                                    onToggleSelect={toggleSelect}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow p-6 sticky top-24">
                        <h3 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h3>

                        <div className="space-y-3">
                            <div className="flex justify-between text-gray-600">
                                <span>Số sản phẩm đã chọn</span>
                                <span>{selectedQuantity || '—'}</span>
                            </div>

                            <div className="flex justify-between text-gray-600">
                                <span>Tạm tính (đã chọn)</span>
                                <span>{selectedTotal.toLocaleString('vi-VN')} ₫</span>
                            </div>

                            <hr className="my-4" />

                            <div className="flex justify-between font-semibold text-xl">
                                <span>Tổng cộng</span>
                                <span className="text-red-600">{selectedTotal.toLocaleString('vi-VN')} ₫</span>
                            </div>

                            <Button
                                onClick={handleCheckoutSelected}
                                disabled={selectedItems.length === 0}
                                className="w-full mt-6 py-6 text-lg bg-blue-600 hover:bg-blue-700"
                            >
                                Thanh toán {selectedItems.length > 0 ? `(${selectedItems.length})` : ''}
                            </Button>

                            <Link
                                to="/product"
                                className="w-full mt-3 py-3 rounded-lg text-blue-600 border border-blue-600 hover:bg-blue-50 text-center block transition"
                            >
                                Tiếp tục mua sắm
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
