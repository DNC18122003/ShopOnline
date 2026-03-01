import customizeAPI from '../customizeApi';
// Get profile
export const getProfile = () => {
    return customizeAPI.get('/customer/profile');
};
// update profile
export const updateProfileService = (data) => {
    return customizeAPI.put('/customer/profile', data);
};
export const updateAvatarService = (formData) => {
    return customizeAPI.put('/customer/profile/avatar', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};
