import { createContext, useContext, useEffect, useState } from 'react';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../services/customer/cart.api';

//  Tạo Context
const CartContext = createContext(null);

//  Provider
export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);

    // Load cart khi app start / user login
    const fetchCart = async () => {
        try {
            setLoading(true);
            const res = await getCart();
            setCart(res.data);
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

    // Actions
    const handleAddToCart = async (productId, quantity = 1) => {
        await addToCart({ productId, quantity });
        await fetchCart();
    };

    const handleUpdateQuantity = async (productId, quantity) => {
        await updateCartItem({ productId, quantity });
        await fetchCart();
    };

    const handleRemoveItem = async (productId) => {
        await removeCartItem(productId);
        await fetchCart();
    };

    const handleClearCart = async () => {
        await clearCart();
        setCart(null);
    };

    
    const value = {
        cart,
        loading,
        fetchCart,
        addToCart: handleAddToCart,
        updateQuantity: handleUpdateQuantity,
        removeItem: handleRemoveItem,
        clearCart: handleClearCart,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used inside CartProvider');
    }
    return context;
};
