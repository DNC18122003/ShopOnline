import customizeAPI from '../customizeApi';
// Get profile
export const getProfile = () => {
    return customizeAPI.get('/customer/profile');
};
