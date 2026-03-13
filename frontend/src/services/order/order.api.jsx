
import axios from 'axios';
import customizeAPI from '../customizeApi'; 
import { toast } from 'react-toastify';

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

// 2. Tạo đơn hàng mới
export const createOrder = async (orderPayload) => {
  try {
    const response = await customizeAPI.post('/order/create', orderPayload);
    return response; // { order, message }
  } catch (error) {
    throw error;
  }
};


// 3. Lấy danh sách đơn hàng của tôi
export const getMyOrders = async (params) => {
    const res = await customizeAPI.get('/order/my-orders', { params });
    console.log(res);
    return res.data || res;
};

// 4. Lấy chi tiết một đơn hàng
export const getOrderDetail = async (orderId) => {
  try {
    const response = await customizeAPI.get(`/order/${orderId}`);
    return response;
  } catch (error) {
    console.error(`Lỗi lấy chi tiết đơn ${orderId}:`, error);
    throw error;
  }
};


// 5. Cập nhật trạng thái đơn 
export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const response = await customizeAPI.patch(`/order/${orderId}/status`, {
      status: newStatus,
    });
  
    return response;
  } catch (error) {
    throw error;
  }
};

// 6. Xác nhận thanh toán MoMo (local project)
export const confirmMomoPayment = async (orderId) => {
  try {
    const response = await customizeAPI.post('/order/momo/confirm', {
      orderId,
    });

    return response.data;
  } catch (error) {
    console.error('Lỗi confirm MoMo:', error);
    throw error;
  }
};

// 7. Hủy đơn hàng (chỉ khi pending)
export const cancelOrder = async (orderId) => {
  try {
    const response = await customizeAPI.patch(
      `/order/${orderId}/cancel`
    );

    toast.success('Hủy đơn hàng thành công');
    return response;
  } catch (error) {
    toast.error(
      error.response?.data?.message || 'Không thể hủy đơn hàng'
    );
    throw error;
  }
};

// 8. Lấy tất cả đơn hàng (admin / staff)
export const getAllOrders = async () => {
    try {
        const response = await customizeAPI.get('/order');

        console.log('SERVICE:', response);

        return response.data || response; // API trả trực tiếp mảng orders
    } catch (error) {
        console.error('Lỗi getAllOrders:', error);
        throw error;
    }
};

