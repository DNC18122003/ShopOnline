import StaffLayout from '@/components/layouts/staff-layout';

import ProtectedRoute from './protected-route';
import { UserProfile } from '@/pages/user';
import { CategoryManagement } from '@/pages/Staff/CategoryManagement';
// Chỉ export mảng object, không tạo router tại đây
export const staffRoutes = [
    {
        path: '/staff',
        element: (
            <ProtectedRoute requiredRole="Staff">
                <StaffLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                path: 'profile',
                element: <UserProfile />,
            },
            {
                path: 'categories',
                element: <CategoryManagement />,
            },
        ],
    },
];
