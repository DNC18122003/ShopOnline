import Login from '@/pages/public/login';
import HomePage from '@/pages/public/homePage';
import Register from '@/pages/public/register';
import ProductListingPage from '@/pages/product/product_listing_page';
import BuildPcPage from '@/pages/product/build_pc';
import UserLayout from '@/components/layouts/user-layout';
import DiscountPage from '@/pages/Discount/page';
import BlogPage from '@/pages/Blog/page';
import CartPage from '@/pages/cart/CartPage';
import ProductDetailPage from '@/pages/product/product_detail_page';
import CheckoutPage from '@/pages/order/CheckoutPage';
import BlogDetails from '@/components/Blog/blog-details';
import PaymentResultPage from '@/pages/order/PaymentResultPage';
import OrderFailedPage from '@/pages/order/OrderFailedPage';
import OrderSuccessPage from '@/pages/order/OrderSuccessPage';
import VerifyRegisterOtp from '@/pages/verify-OTP/verifyRegisterOtp';
import ForgotPasswordPage from '@/pages/password/forgotPasswordPage';

import PcTemplatesPage from '@/pages/product/PcTemplatesPage';
import PcTemplateDetailPage from '@/pages/product/PcTemplateDetailPage';
import AuthLayout from '@/components/layouts/auth-layout';
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
            {
                path: '/product',
                element: <ProductListingPage />,
            },
            {
                path: '/build-pc',
                element: <BuildPcPage />,
            },
            {
                path: '/pc-templates',
                element: <PcTemplatesPage />,
            },
            {
                path: '/pc-template/:id',
                element: <PcTemplateDetailPage />,
            },

            {
                path: '/product/:id',
                element: <ProductDetailPage />,
            },
            {
                path: '/cart',
                element: <CartPage />,
            },
            {
                path: '/checkout',
                element: <CheckoutPage />,
            },
            {
                path: '/payment-result',
                element: <PaymentResultPage />,
            },
            {
                path: '/order-success',
                element: <OrderSuccessPage />,
            },
            {
                path: '/order-failed',
                element: <OrderFailedPage />,
            },
        ],
    },
    {
        path: '/',
        element: <AuthLayout />,
        children: [
            {
                path: '/login',
                element: <Login />,
            },
            {
                path: '/register',
                element: <Register />,
            },
            {
                path: '/forgot-password',
                element: <ForgotPasswordPage />,
            },
            {
                path: '/verify_otp',
                element: <VerifyRegisterOtp />,
            },
        ],
    },
    {
        path: '/discount',
        element: <DiscountPage />,
    },
    {
        path: '/blog',
        element: <BlogPage />,
    },
    {
        path: '/blogDetails',
        element: <BlogDetails />,
    },
];
