import React from 'react';
import { Outlet, NavLink, href, useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { cn } from '@/lib/utils';
const navLinkItems = [
    {
        href: '/profile',
        title: 'Thông tin cá nhân',
    },
    {
        href: '/profile/orders',
        title: 'Đơn hàng của tôi',
    },
    {
        href: '/profile/change-password',
        title: 'Đổi mật khẩu',
    },
];
const ProfileLayout = () => {
    return (
        <div className="flex-1 bg-gray-50 p-5">
            <div className="flex gap-5 items-start">
                {/* ===== SIDEBAR ===== */}
                <aside className=" w-72 bg-white px-6 py-8 flex flex-col shadow-md rounded-lg ">
                    {/* User info */}
                    <div className="flex flex-col items-center text-center mb-8">
                        <img
                            src="https://i.pravatar.cc/100"
                            alt="avatar"
                            className="w-20 h-20 rounded-full object-cover mb-3"
                        />
                        <h3 className="font-semibold text-gray-900">Nguyễn Văn A</h3>
                        <p className="text-sm text-gray-500">nguyenvana@email.com</p>
                    </div>
                    {/* Menu */}
                    <nav className="space-y-2">
                        {navLinkItems.map((link, index) => {
                            const isActive = location.pathname === link.href;
                            return (
                                <NavLink
                                    to={link.href}
                                    className={cn(
                                        'flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium',
                                        isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100',
                                    )}
                                >
                                    {link.title}
                                </NavLink>
                            );
                        })}
                    </nav>
                    {/* Logout */}
                    <button className="mt-6 px-4 flex items-center gap-2 text-red-500 text-sm font-medium hover:text-red-600">
                        Đăng xuất
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
            <ToastContainer />
        </div>
    );
};

export default ProfileLayout;
