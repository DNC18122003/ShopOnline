import React, { useContext, useMemo } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { AuthContext } from '@/context/authContext';
import { cn } from '@/lib/utils';

import { Menu, Home, Package, FolderOpen, LogOut, Users, ShoppingCart, Cpu } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'react-toastify';

import { logout_service } from '@/services/auth/authService';
const navLinkItems = [
    {
        href: '/sale/dashboard',

        title: 'Trang chủ',
        icon: <Home />,
    },
    {
        href: '/link_2',
        title: 'Ten tab số 2',
        icon: <Package />,
    },
    {
        href: '/link_3',
        title: 'Ten tab số 3',
        icon: <FolderOpen />,
    },
];
const SaleLayout = () => {
    //hook
    const { setUser } = useContext(AuthContext);
    // state
    const data_ui = JSON.parse(localStorage.getItem('data_ui'));
    const navigate = useNavigate();
    const handleLogut = async () => {
        try {
            await logout_service();
            localStorage.removeItem('data_ui');
            setUser(null);
            toast.success('Đăng xuất thành công !');
            setTimeout(() => {
                navigate('/login');
            }, 1000);
        } catch (error) {
            console.log(error);
        }
    };

    const currentNav = useMemo(() => {
        return navLinkItems.find((link) => link.href === location.pathname);
    }, [location.pathname]);
    return (
        <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
            {/* header */}
            <header className="bg-white py-3 flex items-center gap-5 border-b">
                {/* Logo Web */}
                <div className="flex items-center gap-2 px-6 w-auto md:w-64 border-r ">
                    <div className="h-8 w-8 flex items-center justify-center">
                        <Cpu className="text-blue-700" />
                    </div>
                    <span className="font-bold text-blue-700 hidden md:block">TechStore</span>
                </div>
                {/* Ten menu */}
                <div className="flex items-center gap-2 px-2 ">
                    <div className="h-8 w-8 flex items-center justify-center text-blue-700">{currentNav?.icon}</div>
                    <span className="font-bold text-blue-700">{currentNav?.title}</span>
                </div>
            </header>

            {/* section - thay h-full bằng flex-1 */}
            <section className="flex flex-1 min-h-0">
                {/* Sidebar */}
                <aside className="w-auto md:w-64 bg-white border-r p-3 flex flex-col">
                    <nav className="space-y-2 flex-1">
                        {navLinkItems.map((link, index) => {
                            const isActive = location.pathname === link.href;
                            // console.log('SaleLayout - location.pathname:', location.pathname);
                            // console.log('SaleLayout - link.href:', link.href);
                            // console.log('isActive:', isActive);
                            return (
                                <NavLink
                                    key={index}
                                    to={link.href}
                                    className={cn(
                                        'flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium',
                                        isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100',
                                    )}
                                >
                                    {link.icon}
                                    <span className="hidden md:block">{link.title}</span>
                                </NavLink>
                            );
                        })}
                    </nav>
                    {/* Profile */}
                    {data_ui && (
                        <div className="p-3">
                            <div className="flex flex-col md:flex-row items-center justify-center gap-2">
                                <Avatar className="h-8 w-8 md:h-10 md:w-10 cursor-pointer">
                                    <AvatarImage src={data_ui.avatar} />
                                    <AvatarFallback>
                                        {' '}
                                        {data_ui?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800 md:text-sm text-[0.65rem]">
                                        {data_ui.userName}
                                    </p>
                                    <p className="text-xs text-gray-500 md:block hidden">{data_ui.email}</p>
                                </div>
                                <button className="text-gray-400 hover:text-gray-600" onClick={handleLogut}>
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-auto">
                    <Outlet />
                </main>
            </section>
        </div>
    );
};

export default SaleLayout;
