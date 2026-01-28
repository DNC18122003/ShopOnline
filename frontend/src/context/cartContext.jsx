// context/cartContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import * as cartApi from '@/services/customer/cart.api';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);

    // fetch cart
    const fetchCart = async () => {
        try {
            setLoading(true);
            const res = await cartApi.getCart();
            setCart(res);
        } catch (err) {
            console.error('Fetch cart failed', err);
            setCart(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    //  ADD TO CART (NHẬN OBJECT)
    const addToCart = async (payload) => {
       
        await cartApi.addToCart(payload);
        await fetchCart();
    };

    const updateQuantity = async (productId, quantity) => {
        await cartApi.updateCartItem({ productId, quantity });
        await fetchCart();
    };

    const removeItem = async (productId) => {
        await cartApi.removeCartItem(productId);
        await fetchCart();
    };

    const clearCart = async () => {
        await cartApi.clearCart();
        setCart(null);
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                loading,
                fetchCart,
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
    const ctx = useContext(CartContext);
    if (!ctx) {
        throw new Error('useCart must be used inside CartProvider');
    }
    return ctx;
};
