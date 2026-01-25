// services/cart.api.jsx
import api from '../customizeApi';


export const getCart = () => {
    return api.get('/cart/');
};

export const addToCart = (payload) => {
    return api.post('/cart/add', payload);
};

export const updateCartItem = (payload) => {
    return api.put('/cart/update', payload);
};


export const removeCartItem = (productId) => {
    return api.delete(`/cart/remove/${productId}`);
};


export const clearCart = () => {
    return api.delete('/cart/clear');
};
