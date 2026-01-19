import { createBrowserRouter } from 'react-router-dom';
import {

} from "@/components/layouts";
import { NotFound } from '@/pages';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <div>Hẹ Hẹ Hẹ</div>,
        children: [],
    },

    {
        path: '*',
        element: <NotFound />,
    },
]);
