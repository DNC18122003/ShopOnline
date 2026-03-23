import AdminLayout from '@/components/layouts/admin-layout';

import ProtectedRoute from './protected-route';
import { UserProfile } from '@/pages/user';
import ManageUserPage from '@/pages/admin/manageUser/ManageUserPage';
import AdminDashBoard from '@/pages/admin/AdminDashBoard';
import OrderManagement from '@/pages/admin/OrderManagement';
import OrderDetailPage from '@/pages/order/OrderDetailPage';

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
                element: <OrderDetailPage/>,
            },
        ],
    },
];
