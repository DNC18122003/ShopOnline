import customizeAPI from '../customizeApi';
// Get profile
export const getProfile = () => {
    return customizeAPI.get('/customer/profile');
};
// update profile
export const updateProfileService = (data) => {
    return customizeAPI.put('/customer/profile', data);
};
