import SaleLayout from '@/components/layouts/sale-layout';

import ProtectedRoute from './protected-route';
import DiscountPage from '@/pages/Discount/page';
import BlogPage from '@/pages/Blog/page';
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
                path: 'discount',
                element: <DiscountPage />,
            },
            {
                path: 'blog',
                element: <BlogPage />,
            },
        ],
    },
];
