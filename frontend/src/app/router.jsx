import { createBrowserRouter } from 'react-router-dom';
import {DiscountPage} from "@/pages/Discount/page";
import { NotFound } from '@/pages';
import DiscountPage from '@/pages/Discount/page';
export const router = createBrowserRouter([
    {
        path: '/',
        element: <div>Hẹ Hẹ Hẹ</div>,
        children: [],
    },
    {
        path: '/discount', 
        element: <DiscountPage />,
    },
    {
        path: '*',
        element: <NotFound />,
    },
    
    
]);
