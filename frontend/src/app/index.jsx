import { createBrowserRouter } from 'react-router-dom';
import { publicRoutes } from './public-router';
import { userRoutes } from './user-router';
import { saleRoutes } from './sale-router';
import { staffRoutes } from './staff-router';
import { adminRoutes } from './admin-route';
import { NotFound } from '@/pages';
import Page403 from '@/pages/403-author/page';

import BannerPage from '@/pages/banner/bannerPage';

// Merge tất cả các route lại
const finalRoutes = [
    ...publicRoutes,
    ...userRoutes,
    ...saleRoutes,
    ...staffRoutes,
    ...adminRoutes,
    {
        path: '/403_unauthorized',
        element: <Page403 />,
    },
    {
        path: '/banned',
        element: <BannerPage />,
    },
    {
        path: '*',
        element: <NotFound />,
    },
];

export const router = createBrowserRouter(finalRoutes);
