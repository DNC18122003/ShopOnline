import customizeAPI from '../customizeApi';

const commentService = {
    // Lấy danh sách comment theo productId
    getCommentsByProductId: (id) => {
        return customizeAPI.get(`/comments/${id}`);
    },
    createComment: (data) => {
        return customizeAPI.post('/comments', data);
    },
    getAllComment: () => {
        return customizeAPI.get('/comments');
    },
    toggleCommentStatus: (id, isActive) => {
        return customizeAPI.put(`/comments/${id}`, { isActive });
    },
    getAvailableDiscounts: (params = {}) => {
        return customizeAPI.get('/discounts/available', { params });
    },
};

export default commentService;
