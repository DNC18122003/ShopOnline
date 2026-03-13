import customizeAPI from './auth/authService';

export const getStaffDashboardDataService = async () => {
    try {
        const response = await customizeAPI.get('/dashboard/staff');
        return response.data;
    } catch (error) {
        console.error("Lỗi khi gọi API Staff Dashboard:", error);
        throw error;
    }
};
