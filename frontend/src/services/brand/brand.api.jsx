import api from '../customizeApi';


export const getBrands = (params) => {
    return api.get("/brands", { params });
};


export const getBrandById = (id) => {
    return api.get(`/brands/${id}`);
};


export const getBrandBySlug = (slug) => {
    return api.get(`/brands/slug/${slug}`);
};


export const createBrand = (data) => {
    return api.post("/brands", data);
};


export const updateBrand = (id, data) => {
    return api.put(`/brands/${id}`, data);
};


export const deleteBrand = (id) => {
    return api.delete(`/brands/${id}`);
};
