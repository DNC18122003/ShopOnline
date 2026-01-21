import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const login_service = async (email, password) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
        return response;
    } catch (error) {
        throw error;
    }
};
export const register_service = async (profileName, email, password) => {
    console.log('Register service called with:', profileName, email, password);
    console.log('API_BASE_URL:', `${API_BASE_URL}/auth/register`);
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/register`, { profileName, email, password });
        return response;
    } catch (error) {
        throw error;
    }
};
