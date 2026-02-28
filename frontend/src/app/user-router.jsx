import UserLayout from '@/components/layouts/user-layout';
import { UserProfile } from '@/pages/user';
import ProtectedRoute from './protected-route';
import ProfileLayout from '@/components/layouts/profile-layout';
import CartPage from '@/pages/cart/CartPage';
import MyOrderPage from '@/pages/order/MyOrderPage';
import OrderDetailPage from '@/pages/order/OrderDetailPage';
// Chỉ export mảng object, không tạo router tại đây
export const userRoutes = [
    {
        path: '/',
        element: (
            <ProtectedRoute requiredRole="Customer">
                <UserLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                path: '/profile',
                element: <ProfileLayout />,
                children: [
                    {
                        index: true,
                        element: <UserProfile />,
                    },
                    {
                        path: 'orders',
                        element: <MyOrderPage />,
                    },
                ],
            },
            {
                path: 'orders/:id',
                element: <OrderDetailPage />,
            },
        ],
    },
];
