import StaffLayout from '@/components/layouts/staff-layout';
import ProtectedRoute from './protected-route';
import { UserProfile } from '@/pages/user';
import { CategoryManagement } from '@/pages/Staff/CategoryManagement';
import { BrandManagement } from '@/pages/Staff/BrandManagement';
import { BuildPcTemplateManagement } from '@/pages/Staff/BuildPcTemplateManagement';
import { CreateProduct } from '@/pages/Staff/CreateProduct';
import { ProductManagement } from '@/pages/Staff/ProductManagement';

import Dashboard from '@/pages/Staff/Dashboard';
import CustomerManager from '@/pages/Staff/CustomerManager';
import Profile from '@/pages/Staff/Profile';

// Chỉ export mảng object, không tạo router tại đây
export const staffRoutes = [
    {
        path: '/staff',
        element: (
            <ProtectedRoute requiredRole="Staff">
                <StaffLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                path: 'dashboard',
                element: <Dashboard />,
            },
            {
                path: 'profile',
                element: <Profile />,
            },
            {
                path: 'categories',
                element: <CategoryManagement />,
            },
            {
                path: 'brands',
                element: <BrandManagement />,
            },
            {
                path: 'products',
                element: <ProductManagement />,
            },
            {
                path: 'products/create',
                element: <CreateProduct />,
            },
            {
                path: 'build-pc-templates',
                element: <BuildPcTemplateManagement />,
            },
            {
                path: 'manage-customers',
                element: <CustomerManager />,
            },
        ],
    },
];
