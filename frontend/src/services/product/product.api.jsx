import api from '../customizeApi';

export const getProducts = (params) => {
    return api.get('/product', { params });
};

export const getProductById = (id) => {
    return api.get(`/product/${id}`);
};

export const getSimilarProducts = (id, params) => {
    return api.get(`/product/${id}/similar`, { params });
};

export const checkBuildPcCompatibility = (components) => {
    return api.post('/product/build-pc/check-compatibility', { components });
};

export const createProduct = (data) => {
    return api.post('/product', data);
};

export const updateProduct = (id, data) => {
    return api.put(`/product/${id}`, data);
};

export const deleteProduct = (id) => {
    return api.delete(`/product/${id}`);
};

export const uploadImages = (formData) => {
    return api.post('/upload/images', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};
