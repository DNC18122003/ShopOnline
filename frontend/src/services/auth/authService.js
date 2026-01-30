import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import customizeAPI from '../customizeApi';
export const login_service = async (email, password) => {
    try {
        const response = await customizeAPI.post(`${API_BASE_URL}/auth/login`, { email, password });
        return response;
    } catch (error) {
        throw error;
    }
};
export const register_service = async (userName, email, password) => {
    // console.log('Register service called with:', userName, email, password);
    // console.log('API_BASE_URL:', `${API_BASE_URL}/auth/register`);
    try {
        const response = await customizeAPI.post(`${API_BASE_URL}/auth/register`, { userName, email, password });
        return response;
    } catch (error) {
        throw error;
    }
};
// logout
export const logout_service = async () => {
    try {
        const response = await customizeAPI.post(`${API_BASE_URL}/auth/logout`, {});
        return response;
    } catch (error) {
        throw error;
    }
};
export const getMe = async () => {
    return customizeAPI.get('/auth/me');
};
