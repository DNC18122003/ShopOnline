import customizeAPI from '../customizeApi';
import api from '../customizeApi';

// export const getDashBoard = () => {
//     return api.get('/admin/dashboard');

export const getDashBoard = async () => {
    try {
        const res = await customizeAPI.get('/admin/dashboard');

        console.log('API RES:', res);

        return res.data; // ✅ LẤY ĐÚNG
    } catch (error) {
        console.error('Dashboard API error:', error);
        throw error;
    }
};