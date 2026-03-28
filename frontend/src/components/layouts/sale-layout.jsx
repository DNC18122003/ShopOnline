import React, { useContext, useMemo } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';

import { AuthContext } from '@/context/authContext';
import { cn } from '@/lib/utils';

import { Package, FolderOpen, LogOut, Cpu, Clipboard, Star, ChartAreaIcon, MessageCircleCode } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'react-toastify';
import { logout_service } from '@/services/auth/authService';

const navLinkItems = [
    {
        href: '/sale/dashboard',
        title: 'Dashboard',
        icon: <ChartAreaIcon className="w-5 h-5" />,
    },
    {
        href: '/sale/discount',
        title: 'Quản lý mã khuyến mại',
        icon: <Package className="w-5 h-5" />,
    },
    {
        href: '/sale/orders',
        title: 'Đơn hàng',
        icon: <Clipboard className="w-5 h-5" />,
    },
    {
        href: '/sale/review',
        title: 'Đánh giá sản phẩm',
        icon: <Star className="w-5 h-5" />,
    },
    {
        href: '/sale/blog',
        title: 'Quản lý Blog',
        icon: <FolderOpen className="w-5 h-5" />,
    },
    {
        href: '/sale/comment',
        title: 'Quản lý comment',
        icon: <MessageCircleCode className="w-5 h-5" />,
    },
    {
        href: '/sale/forgot-password',
        title: 'Đổi mật khẩu',
        icon: <MessageCircleCode className="w-5 h-5" />,
    },
];

const SaleLayout = () => {
    const { setUser } = useContext(AuthContext);

    const navigate = useNavigate();
    const location = useLocation();

    const data_ui = JSON.parse(localStorage.getItem('data_ui'));

    const handleLogout = async () => {
        try {
            await logout_service();

            localStorage.removeItem('data_ui');
            setUser(null);

            toast.success('Đăng xuất thành công!');

            setTimeout(() => {
                navigate('/login');
            }, 800);
        } catch (error) {
            console.log(error);
            toast.error('Đăng xuất thất bại');
        }
    };

    const currentNav = useMemo(() => {
        return navLinkItems.find((link) => location.pathname.startsWith(link.href));
    }, [location.pathname]);

    return (
        <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
            {/* HEADER */}
            <header className="bg-white py-3 flex items-center gap-5 border-b shadow-sm">
                {/* LOGO */}
                <div className="flex items-center gap-2 px-6 w-auto md:w-64 border-r">
                    <div className="h-8 w-8 flex items-center justify-center">
                        <Cpu className="text-blue-700 w-6 h-6" />
                    </div>

                    <span className="font-bold text-blue-700 hidden md:block">TechStore</span>
                </div>

                {/* PAGE TITLE */}
                <div className="flex items-center gap-2 px-2">
                    <div className="h-8 w-8 flex items-center justify-center text-blue-700">{currentNav?.icon}</div>

                    <span className="font-bold text-blue-700">{currentNav?.title || 'Dashboard'}</span>
                </div>
            </header>

            {/* BODY */}
            <section className="flex flex-1 min-h-0">
                {/* SIDEBAR */}
                <aside className="w-auto md:w-64 bg-white border-r p-3 flex flex-col">
                    <nav className="space-y-2 flex-1">
                        {navLinkItems.map((link, index) => {
                            const isActive = location.pathname.startsWith(link.href);

                            return (
                                <NavLink
                                    key={index}
                                    to={link.href}
                                    className={cn(
                                        'flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition',
                                        isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100',
                                    )}
                                >
                                    {link.icon}

                                    <span className="hidden md:block">{link.title}</span>
                                </NavLink>
                            );
                        })}
                    </nav>

                    {/* PROFILE */}
                    {data_ui && (
                        <div className="p-3 border-t">
                            <div className="flex flex-col md:flex-row items-center gap-2">
                                <Avatar
                                    className="h-8 w-8 md:h-10 md:w-10 cursor-pointer"
                                    onClick={() => navigate('/sale/profile')}
                                >
                                    <AvatarImage src={data_ui.avatar} />

                                    <AvatarFallback>
                                        {data_ui?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 text-center md:text-left">
                                    <p className="font-semibold text-gray-800 md:text-sm text-[0.65rem]">
                                        {data_ui.userName}
                                    </p>

                                    <p className="text-xs text-gray-500 hidden md:block">
                                        {data_ui.email ? data_ui.email.slice(0, 18) + '...' : ''}
                                    </p>
                                </div>

                                <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition">
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </aside>

                <main className="flex-1 overflow-auto bg-gray-50">
                    <Outlet />
                </main>
            </section>
        </div>
    );
};

export default SaleLayout;
