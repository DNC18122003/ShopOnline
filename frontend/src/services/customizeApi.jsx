// services/customizeAPI.jsx
import axios from 'axios';
import { toast } from 'react-toastify';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9999/api';
const customizeAPI = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

customizeAPI.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken'); // đúng key bạn đang dùng
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
            toast.error('Bé yêu vui lòng đăng nhập để sử dụng dịch vụ này nhé!');
        } else if (error.response?.status === 403) {
            console.log('Forbidden - không có quyền truy cập');
            toast.error('Bé yêu không có quyền thực hiện hành động này, đi ra chỗ khác chơi !');
        }
        return Promise.reject(error);
    },
);

export default customizeAPI;
