import Login from '@/pages/public/login';
import HomePage from '@/pages/public/homePage';
import Register from '@/pages/public/register';
import UserLayout from '@/components/layouts/user-layout';
import TestTai from '@/pages/public/testTai';
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
        path: '/test',
        element: <TestTai/>,
    },
];
