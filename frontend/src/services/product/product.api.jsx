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
