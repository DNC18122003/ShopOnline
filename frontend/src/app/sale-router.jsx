import SaleLayout from '@/components/layouts/sale-layout';

import ProtectedRoute from './protected-route';
import { UserProfile } from '@/pages/user';
// Chỉ export mảng object, không tạo router tại đây
export const saleRoutes = [
    {
        path: '/sale',
        element: (
            <ProtectedRoute requiredRole="Sale">
                <SaleLayout />
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
