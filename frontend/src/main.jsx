import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/app';
import { AuthProvider } from './context/authContext';
import { ContextProvider } from './context/context';
import './index.css';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AuthProvider>
            <ContextProvider>
                <RouterProvider router={router} />
            </ContextProvider>
        </AuthProvider>
    </StrictMode>,
);
