import Login from '@/pages/public/login';
import HomePage from '@/pages/public/homePage';
import Register from '@/pages/public/register';
import UserLayout from '@/components/layouts/user-layout';
import DiscountPage from '@/pages/Discount/page';
import BlogPage from '@/pages/Blog/page';
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
    {
        path: '/discount',
        element: <DiscountPage />,
    },
    {
        path: '/blog',
        element: <BlogPage />,
    },
];
