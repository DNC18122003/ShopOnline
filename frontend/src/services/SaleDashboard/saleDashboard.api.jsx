import customizeAPI from '../customizeApi';

const saleDashboardService = {
    // Lấy dữ liệu tổng quan cho dashboard theo tháng và năm
    getDashboardSummary: (month, year, userId) => {
        return customizeAPI.get('/dashboard/summary', {
            params: {
                month: month,
                year: year,
                userId: userId,
            },
        });
    },
};

export default saleDashboardService;
