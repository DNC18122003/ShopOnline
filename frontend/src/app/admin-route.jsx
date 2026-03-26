import AdminLayout from '@/components/layouts/admin-layout';

import ProtectedRoute from './protected-route';
import { UserProfile } from '@/pages/user';
import ManageUserPage from '@/pages/admin/manageUser/ManageUserPage';
import AdminDashBoard from '@/pages/admin/AdminDashBoard';
import OrderManagement from '@/pages/admin/OrderManagement';
import OrderDetailPage from '@/pages/order/OrderDetailPage';
import ManageDepartment from '@/pages/admin/manageDepartment/ManageDepartment';
import path from 'node:path';
import Profile from '@/pages/admin/Profile';
import ChangePasswordPage from '@/pages/password/changePwEmloyee';

// Chỉ export mảng object, không tạo router tại đây
export const adminRoutes = [
    {
        path: '/admin',
        element: (
            <ProtectedRoute requiredRole="Admin">
                <AdminLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                path: 'dashboard',
                element: <AdminDashBoard />,
            },
            {
                path: 'manage-user',
                element: <ManageUserPage />,
            },
            {
                path: 'order',
                element: <OrderManagement />,
            },
            {
                path: 'order/:id',
                element: <OrderDetailPage />,
            },
            {
                path: 'manage-department',
                element: <ManageDepartment />,
            },
            {
                path: 'profile',
                element: <Profile />,
            },
            {
                path: 'forgot-password',
                element: <ChangePasswordPage />,
            },
        ],
    },
];
