import customizeAPI from '../customizeApi';
import { toast } from 'react-toastify';

/**
 * 1. Lấy danh sách các đơn hàng ĐANG CHỜ (waiting)
 * Hệ thống mới gán cho Sale này nhưng Sale chưa bấm nhận.
 */
export const getPendingAssignments = async () => {
    try {
        const response = await customizeAPI.get('/order/sale/pending-assignments');
        return response.data || response;
    } catch (error) {
        console.error('Lỗi lấy đơn hàng chờ gán:', error);
        throw error;
    }
};

/**
 * 2. Chấp nhận đơn hàng (Accept)
 * Chuyển trạng thái Assignment sang 'accepted' và Order sang 'confirmed'.
 */
export const acceptOrder = async (orderId) => {
    try {
        const response = await customizeAPI.post(`/order/sale/accept/${orderId}`);
        toast.success('Đã tiếp nhận đơn hàng thành công');
        return response.data || response;
    } catch (error) {
        const message = error.response?.data?.message || 'Không thể nhận đơn hàng này';
        toast.error(message);
        throw error;
    }
};

/**
 * 3. Từ chối đơn hàng (Reject)
 * Đưa đơn hàng trở lại hàng đợi để hệ thống gán cho Sale khác.
 */
export const rejectOrder = async (orderId) => {
    try {
        const response = await customizeAPI.post(`/order/sale/reject/${orderId}`);
        toast.warn('Đã từ chối đơn hàng');
        return response.data || response;
    } catch (error) {
        toast.error('Lỗi khi từ chối đơn hàng');
        throw error;
    }
};

/**
 * 4. Lấy danh sách đơn hàng Sale đang phụ trách (Processing)
 * Bao gồm các đơn đã accept và đang trong quá trình giao/xử lý.
 */
export const getMyProcessingOrders = async () => {
    try {
        const response = await customizeAPI.get('/order/sale/my-processing');
        return response.data || response;
    } catch (error) {
        console.error('Lỗi lấy danh sách đơn đang xử lý:', error);
        throw error;
    }
};

/**
 * 5. Cập nhật trạng thái đơn (Sử dụng lại logic update status chung)
 */
export const updateSaleOrderStatus = async (orderId, newStatus) => {
    try {
        const response = await customizeAPI.patch(`/order/${orderId}/status`, {
            status: newStatus,
        });
        toast.success(`Đã cập nhật đơn sang: ${newStatus}`);
        return response;
    } catch (error) {
        toast.error(error.response?.data?.message || 'Cập nhật trạng thái thất bại');
        throw error;
    }
};
