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
import ComponentOtp from '@/components/public/component.otp';

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
    {
        path: '/send_otp',
        element: <ComponentOtp title={'Xác thực tài khoản'} email={'happynewyear@gmail.com'} />,
    },
];
