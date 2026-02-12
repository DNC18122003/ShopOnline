import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '@/context/authContext';
import { useCart } from '@/context/cartContext';

import { Cpu, LogOut, ShoppingCart, SquareMenu, User } from 'lucide-react';

import { Badge } from '../ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from '@/components/ui/navigation-menu';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { toast } from 'react-toastify';

import { logout_service } from '@/services/auth/authService';

const header = () => {
    const { setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const data_ui = JSON.parse(localStorage.getItem('data_ui'));
    const NAV_ITEMS = [
        { name: 'Trang chủ', url: '/' },
        { name: 'Sản phẩm', url: '/product' },
        { name: 'Build PC', url: '/build-pc' },
        { name: 'Về chúng tôi', url: '/about' },
        { name: 'Liên hệ', url: '/contact' },
    ];
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
    const { cart } = useCart();

    return (
        <header className="w-full border-b bg-white">
            <div className="flex h-16 justify-between items-center px-4">
                {/* Logo */}
                <div className="flex items-center gap-2" onClick={() => navigate('/')}>
                    <div className="h-8 w-8 flex items-center justify-center">
                        <Cpu className="text-blue-700" />
                    </div>
                    <span className="font-bold text-blue-700 ">TechStore</span>
                </div>
                {/* Navigation Menu: Home, Products, About us, Support */}
                <div className="hidden md:block">
                    <NavigationMenu>
                        <NavigationMenuList className="gap-6">
                            {NAV_ITEMS.map((item) => (
                                <NavigationMenuItem key={item.url}>
                                    <NavigationMenuLink asChild>
                                        <Link
                                            to={item.url}
                                            className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                                        >
                                            {item.name}
                                        </Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            ))}
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
                {/* sheet menu tablet */}
                <Sheet>
                    <SheetTrigger className="hover:bg-amber-50 md:hidden">
                        <SquareMenu />
                    </SheetTrigger>
                    <SheetContent side="right" className="flex flex-col w-75 sm:w-87 p-4">
                        {/* Cart */}
                        <SheetClose asChild>
                            <Link to="/cart" className="relative cursor-pointer">
                                <div className="relative cursor-pointer">
                                    <ShoppingCart className="h-8 w-8 text-gray-700" />
                                    {cart?.totalQuantity > 0 && (
                                        <Badge className="absolute -right-2 -top-2 h-5 min-w-5 rounded-full px-1 text-xs bg-red-500 text-white">
                                            {cart.totalQuantity}
                                        </Badge>
                                    )}
                                </div>
                            </Link>
                        </SheetClose>

                        {/* 2. Body: Danh sách Menu */}
                        <div className="flex-1 overflow-y-auto ">
                            <nav className="flex flex-col gap-1">
                                {NAV_ITEMS.map((item) => (
                                    <SheetClose asChild key={item.url}>
                                        <Link
                                            to={item.url}
                                            className="flex items-center gap-4 p-4 rounded-xl border text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-all "
                                        >
                                            {/* <span className="text-gray-400 group-hover:text-blue-600">{item.icon}</span> */}
                                            <span className="font-medium">{item.name}</span>
                                        </Link>
                                    </SheetClose>
                                ))}
                            </nav>
                        </div>

                        {/* 3. Footer: Thông tin User & Logout */}
                        <div className="p-4 border-t bg-gray-50/50">
                            {data_ui ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 px-2">
                                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                            <AvatarImage src={data_ui.avatar} />
                                            <AvatarFallback>
                                                {data_ui?.fullName?.charAt(0)?.toUpperCase() || 'A'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-900">Người dùng</span>
                                            <span className="text-xs text-gray-500 italic text-nowrap">
                                                Chào mừng bạn quay lại!
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate('/profile')}
                                            className="flex gap-2"
                                        >
                                            <User size={16} /> Hồ sơ
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={handleLogut}
                                            className="flex gap-2"
                                        >
                                            <LogOut size={16} /> Thoát
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <Button
                                    className="w-full bg-blue-700 hover:bg-blue-800"
                                    onClick={() => navigate('/login')}
                                >
                                    Đăng nhập ngay
                                </Button>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>
                {/* Action Cart + Avatar */}
                <div className="hidden md:flex items-center gap-6">
                    {/* Cart */}
                    <Link to="/cart" className="relative cursor-pointer">
                        <div className="relative cursor-pointer">
                            <ShoppingCart className="h-6 w-6 text-gray-700" />
                            {cart?.totalQuantity > 0 && (
                                <Badge className="absolute -right-2 -top-2 h-5 min-w-5 rounded-full px-1 text-xs bg-red-500 text-white">
                                    {cart.totalQuantity}
                                </Badge>
                            )}
                        </div>
                    </Link>

                    {/* User Avatar */}
                    {data_ui == null ? (
                        <Button variant="outline" onClick={() => navigate('/login')}>
                            Đăng nhập
                        </Button>
                    ) : (
                        <div className="hidden md:block">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Avatar className="h-10 w-10 border-2">
                                        <AvatarImage src={data_ui.avatar} />
                                        <AvatarFallback>
                                            {data_ui?.fullName?.charAt(0)?.toUpperCase() || 'A'}
                                        </AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                                        Thông tin cá nhân
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={handleLogut}>
                                        Đăng xuất
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default header;
