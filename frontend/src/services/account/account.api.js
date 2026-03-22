import customizeAPI from '../customizeApi';

// get list account
export const getListAccount = (params) => {
    return customizeAPI.get('/admin/accounts', { params });
};
export const getNumberOfAccount = () => {
    return customizeAPI.get('/admin/number-of-users');
}
export const getUserSale = (params) => {
    return customizeAPI.get('/admin/user-sale', { params });
}
export const getUserStaff = (params) => {
    return customizeAPI.get('/admin/user-staff', { params });
}
export const getUserAdmin = (params) => {
    return customizeAPI.get('/admin/user-admin', { params });
}
export const createNewEmployee = (data) => {
    return customizeAPI.post('/admin/create-employee', data);
}
export const updateUserStatus = (id, status) => {
    return customizeAPI.put(`/admin/accounts/status`, { id, status })
};
export const getDetailAdmin = (id) => {
    return customizeAPI.get(`/admin/accounts/details-admin/${id}`);
}
export const getDetailStaff = (id) => {
    return customizeAPI.get(`/admin/accounts/details-staff/${id}`);
}
export const getDetailSales = (id) => {
    return customizeAPI.get(`/admin/accounts/details-sales/${id}`);
}
export const getDetailCustomer = (id) => {
    return customizeAPI.get(`/admin/accounts/details-customer/${id}`);
}