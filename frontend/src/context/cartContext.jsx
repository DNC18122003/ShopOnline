'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/authContext';
import {
    getCart,
    addToCart as apiAddToCart,
    updateCartItem as apiUpdateCartItem,
    removeCartItem as apiRemoveCartItem,
    clearCart as apiClearCart,
} from '@/services/customer/cart.api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const isAuthenticated = !!user;
    console.log('User: ', isAuthenticated);

    const [cart, setCart] = useState({
        items: [],
        totalQuantity: 0,
        totalPrice: 0,
    });
    const [loading, setLoading] = useState(true);

    // Load cart khi login
    useEffect(() => {
        const fetchCart = async () => {
            if (!isAuthenticated) {
                setCart({ items: [], totalQuantity: 0, totalPrice: 0 });
                setLoading(false);
                return;
            }

            try {
                const res = await getCart();
                setCart(res.data);
            } catch (err) {
                console.error('Get cart failed:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, [isAuthenticated]);

    // 🚫 Chặn chưa login
    const requireAuth = () => {
        if (!isAuthenticated) {
            throw new Error('Vui lòng đăng nhập để sử dụng giỏ hàng');
        }
    };

    const addToCart = useCallback(
        async (productId, quantity = 1) => {
            requireAuth();

            const res = await apiAddToCart({ productId, quantity });
            setCart(res.data);
        },
        [isAuthenticated],
    );

    const updateQuantity = useCallback(
        async (productId, quantity) => {
            requireAuth();

            await apiUpdateCartItem({ productId, quantity });
            const res = await getCart();
            setCart(res.data);
        },
        [isAuthenticated],
    );

    const removeItem = useCallback(
        async (productId) => {
            requireAuth();

            await apiRemoveCartItem(productId);
            const res = await getCart();
            setCart(res.data);
        },
        [isAuthenticated],
    );

    const clearCart = useCallback(async () => {
        requireAuth();

        await apiClearCart();
        setCart({ items: [], totalQuantity: 0, totalPrice: 0 });
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
        throw new Error('useCart phải được dùng trong CartProvider');
    }
    return context;
};
