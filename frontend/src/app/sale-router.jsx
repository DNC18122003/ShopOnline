import SaleLayout from '@/components/layouts/sale-layout';

import ProtectedRoute from './protected-route';
import DiscountPage from '@/pages/Discount/page';
import BlogPage from '@/pages/Blog/page';
import OrderManagement from '@/pages/Sale/OrderManagement';
import OrderDetailPage from '@/pages/order/OrderDetailPage';
import RatingManagement from '@/pages/Sale/RatingManagement';
import ReviewDetail from '@/pages/Sale/ReviewDetail';
import SalesDashboard from '@/pages/SaleDashboard/page';
import OrderProcessing from '@/pages/Sale/OrderProcessing';
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
            {
                path: 'dashboard',
                element: <SalesDashboard />,
            },
            {
                path: 'orders',
                // element: <OrderManagement />,
                element: <OrderProcessing />,
            },
            {
                path: 'orders/:id',
                element: <OrderDetailPage />,
            },
            {
                path: 'review',
                element: <RatingManagement />,
            },
            {
                path: 'review/:id',
                element: <ReviewDetail />,
            },
            {
                path: 'dashboard',
                element: <SalesDashboard />,
            },
        ],
    },
];
