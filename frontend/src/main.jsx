import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/app';
import { AuthProvider } from './context/authContext';
import { ContextProvider } from './context/context';
import { CartProvider } from './context/cartContext';
import { ToastContainer } from 'react-toastify';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AuthProvider>
            <ContextProvider>
                <CartProvider>
                    <RouterProvider router={router} />
                    <ToastContainer
                        position="top-right"
                        autoClose={3000}
                        hideProgressBar={false}
                        newestOnTop
                        closeOnClick
                        pauseOnHover
                        draggable
                    />
                </CartProvider>
            </ContextProvider>
        </AuthProvider>
    </StrictMode>,
);
