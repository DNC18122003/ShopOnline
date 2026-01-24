import Login from '@/pages/public/login';
import HomePage from '@/pages/public/homePage';
import Register from '@/pages/public/register';
import ProductListingPage from '@/pages/product/product_listing_page';
import UserLayout from '@/components/layouts/user-layout';
import CartPage from '@/pages/cart/CartPage';

// Chỉ export mảng object, không tạo router tại đây
export const publicRoutes = [
    {
        path: '/',
        element: <UserLayout />,
        children: [
            {
                path: '/',
                element: <HomePage />,
            },
            {
                path: '/product',
                element: <ProductListingPage />,
            },
            {
                path: '/cart',
                element: <CartPage />,
            },
        ],
    },
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/register',
        element: <Register />,
    },
];
