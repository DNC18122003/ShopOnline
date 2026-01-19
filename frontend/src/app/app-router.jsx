import { createBrowserRouter } from 'react-router-dom';
// import {

// } from "@/components/layouts";
import { NotFound } from '@/pages';
import Login from '@/pages/public/login';
import HomePage from '@/pages/public/homePage';
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
        path: '*',
        element: <NotFound />,
    },
]);
