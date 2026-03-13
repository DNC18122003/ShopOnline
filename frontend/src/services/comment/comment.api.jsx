import customizeAPI from '../customizeApi';

const commentService = {
    // Lấy danh sách comment theo productId
    getCommentsByProductId: (id) => {
        return customizeAPI.get(`/comments/${id}`);
    },
    createComment: (data) => {
        return customizeAPI.post('/comments', data);
    }
};

export default commentService;
