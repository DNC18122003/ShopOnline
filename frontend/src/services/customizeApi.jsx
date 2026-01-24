// services/customizeAPI.jsx
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9999/api';
const customizeAPI = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

//  (gắn token)
customizeAPI.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// (xử lý lỗi chung)
customizeAPI.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            console.log('Unauthorized - cần login lại');
        }
        return Promise.reject(error);
    },
);

export default customizeAPI;
