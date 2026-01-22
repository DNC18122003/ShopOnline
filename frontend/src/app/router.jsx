import { createBrowserRouter } from 'react-router-dom';
import {

} from "@/components/layouts";
import { NotFound } from '@/pages';
import Login from '@/pages/public/login';
import HomePage from '@/pages/public/homePage';
import Register from '@/pages/public/register';
export const router = createBrowserRouter([
    {
        path: '/',
        element: <HomePage />,
        children: [],
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
        path: '*',
        element: <NotFound />,
    },
]);
