
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9999'; 

export const getAddress = async ({ lat, lon }) => {
    try {
        const response = await axios.get(`${API_URL}/api/order/geocode/reverse`, {
            params: { lat, lon },
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi getAddress:', error);
        throw error;
    }
};
