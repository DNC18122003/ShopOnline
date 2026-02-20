import React, { useContext } from 'react';
import { Outlet, NavLink, href, useNavigate } from 'react-router-dom';

import { User, ShoppingBag, KeyRound, LogOut } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { toast, ToastContainer } from 'react-toastify';
import { logout_service } from '@/services/auth/authService';
import { AuthContext } from '@/context/authContext';

const navLinkItems = [
    {
        href: '/profile',
        title: 'Thông tin cá nhân',
        icon: <User size={20} />,
    },
    {
        href: '/profile/orders',
        title: 'Đơn hàng của tôi',
        icon: <ShoppingBag size={20} />,
    },
    {
        href: '/profile/change-password',
        title: 'Đổi mật khẩu',
        icon: <KeyRound size={20} />,
    },
];
const ProfileLayout = () => {
    const userData = JSON.parse(localStorage.getItem('data_ui')) || {};
    const { setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    // console.log('ProfileLayout userData:', userData);
    const parseName = (name) => {
        // ex : DanNguen1477 => D7
        if (!name) return '';
        name = name.trim();
        if (name.length === 0) return '';
        const firstChar = name.charAt(0).toUpperCase();
        const lastChar = name.length > 1 ? name.charAt(name.length - 1).toUpperCase() : '';
        return firstChar + lastChar;
    };
    const handleLogut = async () => {
        console.log('Logging out...');
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
    return (
        <div className="flex-1 bg-gray-50 p-5">
            <div className="flex gap-5 items-start">
                {/* ===== SIDEBAR ===== */}

                <aside className="w-20 md:w-72 bg-white px-3 md:px-6 py-8 flex flex-col shadow-md rounded-lg">
                    {/* 1. User info: Ẩn text trên mobile, chỉ hiện Avatar */}
                    <div className="flex flex-col items-center text-center mb-8">
                        <Avatar className="w-12 h-12 md:w-20 md:h-20 mb-3 border-2 border-blue-50">
                            <AvatarImage src={userData.avatar} alt="User" />
                            <AvatarFallback>{parseName(userData.userName)}</AvatarFallback>
                        </Avatar>

                        <div>
                            <h3 className="font-semibold text-gray-900 truncate max-w-45 hidden md:block">
                                {userData.email || '--'}
                            </h3>
                            <p className="text-sm text-gray-500">{userData.userName || '--'}</p>
                        </div>
                    </div>

                    {/* 2. Menu Navigation */}
                    <nav className="space-y-2">
                        {navLinkItems.map((link, index) => {
                            const isActive = location.pathname === link.href;
                            return (
                                <NavLink
                                    key={index}
                                    to={link.href}
                                    className={cn(
                                        'flex items-center gap-3 px-4 py-3 md:py-2 rounded-lg text-sm font-medium',
                                        'justify-center md:justify-start',
                                        isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100',
                                    )}
                                >
                                    {/* Luôn hiển thị Icon (Giả sử link.icon chứa component icon) */}
                                    <span className={cn('text-lg', isActive ? 'text-blue-700' : 'text-gray-500')}>
                                        {link.icon}
                                    </span>

                                    {/* Ẩn tiêu đề Nav trên mobile */}
                                    <span className="hidden md:block">{link.title}</span>
                                </NavLink>
                            );
                        })}
                    </nav>

                    {/* 3. Logout Button */}
                    <button
                        className={cn(
                            'mt-auto px-4 py-2 rounded-lg flex items-center gap-2 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors',
                            'justify-center md:justify-start', // Căn giữa trên mobile
                        )}
                        onClick={handleLogut}
                    >
                        <LogOut size={20} />
                        <span className="hidden md:block">Đăng xuất</span>
                    </button>
                </aside>
                <main className="flex-1 p-5 bg-white shadow-md rounded-lg">
                    <Outlet />
                    {/* {Array.from({ length: 50 }).map((_, index) => (
                        <p key={index}>Nội dung chính của trang nhân viên - dòng {index + 1}</p>
                    ))} */}
                </main>
            </div>
            {/* Toast */}
        </div>
    );
};

export default ProfileLayout;
