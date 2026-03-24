import customizeAPI from '../customizeApi';
import { toast } from 'react-toastify';

export const getMySaleOrders = async (page = 1, limit = 10, status = '') => {
    const response = await customizeAPI.get('/order/sale/orders', {
        params: { page, limit, status },
    });

    return response.data || response;
};