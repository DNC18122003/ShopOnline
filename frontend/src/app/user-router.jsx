import UserLayout from '@/components/layouts/user-layout';
import { UserProfile } from '@/pages/user';
import ProtectedRoute from './protected-route';
// Chỉ export mảng object, không tạo router tại đây
export const userRoutes = [
    {
        path: '/',
        element: (
            <ProtectedRoute requiredRole="User">
                <UserLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                path: '/profile',
                element: <UserProfile />,
            },
        ],
    },
];
