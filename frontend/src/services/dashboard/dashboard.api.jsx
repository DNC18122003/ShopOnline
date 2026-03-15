import api from '../customizeApi';

export const getStaffDashboardData = () => {
    return api.get('/dashboard/staff');
};
