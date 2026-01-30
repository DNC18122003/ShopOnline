// services/cart.api.jsx
import api from '../customizeApi';

// GET cart
export const getCart = () => {
    return api.get('/cart/', { withCredentials: true });
};

// ADD to cart
export const addToCart = (payload) => {
    return api.post('/cart/add', payload, { withCredentials: true });
};

// UPDATE cart item
export const updateCartItem = (payload) => {
    return api.put('/cart/update', payload, { withCredentials: true });
};

// REMOVE cart item
export const removeCartItem = (productId) => {
    return api.delete(`/cart/remove/${productId}`, { withCredentials: true });
};

// CLEAR cart
export const clearCart = () => {
    return api.delete('/cart/clear', { withCredentials: true });
};
