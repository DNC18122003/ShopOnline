import customizeAPI from '../customizeApi';
import { toast } from 'react-toastify';

/**
 * 1. Tạo review
 */
export const createReview = async (formData) => {
    try {
        const res = await customizeAPI.post('/review', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return res.data;
    } catch (error) {
        throw error;
    }
};

/**
 * 2. Lấy review theo sản phẩm
 */
export const getReviewsByProduct = async (productId) => {
    try {
        const res = await customizeAPI.get(`/review/product/${productId}`);
        return res.data || res;
    } catch (error) {
        console.error('Lỗi getReviewsByProduct:', error);
        throw error;
    }
};

/**
 * 3. Lấy review của tôi
 */
export const getMyReviews = async () => {
    try {
        const res = await customizeAPI.get('/review/my-reviews');
        return res.data || res;
    } catch (error) {
        console.error('Lỗi getMyReviews:', error);
        throw error;
    }
};

/**
 * 4. Update review
 */
export const updateReview = async (reviewId, payload) => {
    try {
        const res = await customizeAPI.put(`/review/${reviewId}`, payload);

        toast.success('Cập nhật đánh giá thành công');
        return res.data || res;
    } catch (error) {
        toast.error(error.response?.data?.message || 'Không thể cập nhật đánh giá');
        throw error;
    }
};

/**
 * 5. Xóa review
 */
export const deleteReview = async (reviewId) => {
    try {
        const res = await customizeAPI.delete(`/review/${reviewId}`);

        toast.success('Xóa đánh giá thành công');
        return res.data || res;
    } catch (error) {
        toast.error(error.response?.data?.message || 'Không thể xóa đánh giá');
        throw error;
    }
};


/**
 * 6. Check duplicate review
 */

export const checkReview = async (orderId, productId) => {
    const res = await customizeAPI.get(`/review/check/${orderId}/${productId}`);
    return res.data;
};