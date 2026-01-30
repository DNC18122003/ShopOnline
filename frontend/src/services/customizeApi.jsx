// services/customizeAPI.jsx
import axios from 'axios';
import { toast } from 'react-toastify';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9999/api';

const url_need_hidden_toast_erro = [];

const customizeAPI = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // 🔥 cookie auth
});

customizeAPI.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            toast.error('Vui lòng đăng nhập lại');
        }
        if (error.response?.status === 403) {
            toast.error('Bạn không có quyền truy cập');
        }
        return Promise.reject(error);
    },
);

export default customizeAPI;
