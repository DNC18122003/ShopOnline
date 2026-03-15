import AdminLayout from '@/components/layouts/admin-layout';

import ProtectedRoute from './protected-route';
import { UserProfile } from '@/pages/user';
import ManageUserPage from '@/pages/admin/manageUser/ManageUserPage';

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
                element: <UserProfile />,
            },
            {
                path: 'manage-user',
                element: <ManageUserPage />,
            },
        ],
    },
];
