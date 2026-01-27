// src/context/cartContext.js
'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/authContext';
import {
    getCart,
    addToCart as apiAddToCart,
    updateCartItem as apiUpdateCartItem,
    removeCartItem as apiRemoveCartItem,
    clearCart as apiClearCart,
} from '@/services/customer/cart.api'; // api của bạn

const CartContext = createContext();

const LOCAL_CART_KEY = 'guest_cart';

export const CartProvider = ({ children }) => {
    const { user } = useAuth(); // Lấy user từ AuthContext
    const isAuthenticated = !!user; // true nếu đã login

    const [cart, setCart] = useState({ items: [], totalQuantity: 0, totalPrice: 0 });
    const [loading, setLoading] = useState(true);

    // Tính tổng từ items (dùng chung cho cả guest & server)
    const calculateTotals = (items) => ({
        totalQuantity: items.reduce((sum, i) => sum + i.quantity, 0),
        totalPrice: items.reduce((sum, i) => sum + i.quantity * (i.priceSnapshot || 0), 0),
    });

    // Load & sync cart
    useEffect(() => {
        const syncCart = async () => {
            setLoading(true);
            try {
                if (isAuthenticated) {
                    // Đã login → lấy từ server
                    const res = await getCart();
                    let serverCart = res.data || { items: [], totalQuantity: 0, totalPrice: 0 };

                    // Kiểm tra xem có giỏ guest cần merge không
                    const guestJson = localStorage.getItem(LOCAL_CART_KEY);
                    if (guestJson) {
                        const guestCart = JSON.parse(guestJson);
                        if (guestCart?.items?.length > 0) {
                            // Gọi API merge (giả sử bạn đã sửa route thành POST /cart/merge)
                            await fetch('/api/cart/merge', {
                                // hoặc dùng axios/api của bạn
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include', // nếu dùng cookie/session
                                body: JSON.stringify({ items: guestCart.items }),
                            });

                            // Lấy lại cart mới sau merge
                            const refreshed = await getCart();
                            serverCart = refreshed.data || serverCart;
                        }
                        localStorage.removeItem(LOCAL_CART_KEY); // Xóa guest cart sau merge
                    }

                    setCart(serverCart);
                } else {
                    // Chưa login → dùng local
                    const guestJson = localStorage.getItem(LOCAL_CART_KEY);
                    const guestCart = guestJson ? JSON.parse(guestJson) : { items: [] };
                    setCart({
                        ...guestCart,
                        ...calculateTotals(guestCart.items || []),
                    });
                }
            } catch (err) {
                console.error('Sync cart error:', err);
                // Fallback về local nếu server lỗi
                const guestJson = localStorage.getItem(LOCAL_CART_KEY);
                const fallback = guestJson ? JSON.parse(guestJson) : { items: [] };
                setCart({
                    ...fallback,
                    ...calculateTotals(fallback.items || []),
                });
            } finally {
                setLoading(false);
            }
        };

        syncCart();
    }, [isAuthenticated]); // Chạy lại khi trạng thái login thay đổi


    const addToCart = useCallback(
        async (productId, quantity = 1, productInfo = {}) => {
         
            if (isAuthenticated) {
                try {
                    const res = await apiAddToCart({ productId, quantity });
                    setCart(res.data || cart);
                } catch (err) {
                    console.error('Add to cart failed:', err);
                    throw err;
                }
            } else {
                setCart((prev) => {
                    const items = [...(prev.items || [])];
                    const index = items.findIndex((i) => i.productId === productId);

                    if (index > -1) {
                        items[index].quantity += quantity;
                    } else {
                        items.push({
                            productId,
                            quantity,
                            priceSnapshot: productInfo.priceSnapshot || 0,
                            nameSnapshot: productInfo.nameSnapshot || 'Sản phẩm',
                            imageSnapshot: productInfo.imageSnapshot || '',
                        });
                    }

                    const newCart = {
                        items,
                        ...calculateTotals(items),
                    };
                    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(newCart));
                    return newCart;
                });
            }
        },
        [isAuthenticated, cart],
    );

    
    const updateQuantity = useCallback(
        async (productId, quantity) => {
            if (quantity < 0) return;

            if (isAuthenticated) {
                try {
                    await apiUpdateCartItem({ productId, quantity });
                    const res = await getCart();
                    setCart(res.data || cart);
                } catch (err) {
                    console.error('Update failed:', err);
                }
            } else {
                setCart((prev) => {
                    let items = [...(prev.items || [])];
                    if (quantity === 0) {
                        items = items.filter((i) => i.productId !== productId);
                    } else {
                        items = items.map((i) => (i.productId === productId ? { ...i, quantity } : i));
                    }

                    const newCart = {
                        items,
                        ...calculateTotals(items),
                    };
                    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(newCart));
                    return newCart;
                });
            }
        },
        [isAuthenticated, cart],
    );

   
    const removeItem = useCallback(
        async (productId) => {
            if (isAuthenticated) {
                try {
                    await apiRemoveCartItem(productId);
                    const res = await getCart();
                    setCart(res.data || cart);
                } catch (err) {
                    console.error('Remove failed:', err);
                }
            } else {
                setCart((prev) => {
                    const items = (prev.items || []).filter((i) => i.productId !== productId);
                    const newCart = {
                        items,
                        ...calculateTotals(items),
                    };
                    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(newCart));
                    return newCart;
                });
            }
        },
        [isAuthenticated, cart],
    );


    const clearCart = useCallback(async () => {
        if (isAuthenticated) {
            try {
                await apiClearCart();
                setCart({ items: [], totalQuantity: 0, totalPrice: 0 });
            } catch (err) {
                console.error('Clear failed:', err);
            }
        } else {
            localStorage.removeItem(LOCAL_CART_KEY);
            setCart({ items: [], totalQuantity: 0, totalPrice: 0 });
        }
    }, [isAuthenticated]);

    return (
        <CartContext.Provider
            value={{
                cart,
                loading,
                addToCart,
                updateQuantity,
                removeItem,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart phải được dùng bên trong CartProvider');
    }
    return context;
};
