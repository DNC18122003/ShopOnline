import api from '../customizeApi';

export const getProducts = (params) => {
  return api.get("/product", { params });
};

