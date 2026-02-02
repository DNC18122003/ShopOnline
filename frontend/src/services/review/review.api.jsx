import api from '../customizeApi';

export const getReviewByProductId = (id) => {
    return api.get(`/reviews/${id}`);
};
