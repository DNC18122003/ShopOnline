import api from '../customizeApi';

export const getProducts = (params) => {
    return api.get('/product', { params });
};

export const getProductById = (id) => {
    return api.get(`/product/${id}`);
};

