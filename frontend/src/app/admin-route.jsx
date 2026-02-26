import AdminLayout from '@/components/layouts/admin-layout';

import ProtectedRoute from './protected-route';
import { UserProfile } from '@/pages/user';


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
                path: 'profile',
                element: <UserProfile />,
            },
           
        ],
    },
];
