// services/cart.api.jsx
import axios from 'axios';
import api from '../customizeApi';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9999/api';
// GET cart
export const getCart = () => {
    return api.get('/cart/', { withCredentials: true });
};
export const getCartByAxios = () => {
    return axios.get(`${BASE_URL}/cart/`, { withCredentials: true });
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
