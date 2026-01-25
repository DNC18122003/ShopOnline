import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { AuthContext } from '@/context/authContext';
import { useCart } from '@/context/cartContext';

import { Cpu, ShoppingCart } from 'lucide-react';

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
import { toast } from 'react-toastify';

import { logout_service } from '@/services/authService';


const header = () => {
    const { setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const data_ui = localStorage.getItem('data_ui');

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
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 flex items-center justify-center">
                        <Cpu className="text-blue-700" />
                    </div>
                    <span className="font-bold text-blue-700">TechStore</span>
                </div>
                {/* Navigation Menu: Home, Products, About us, Support */}
                <NavigationMenu>
                    <NavigationMenuList className="gap-6">
                        {['Trang chủ', 'Sản phẩm', 'Về chúng tôi', 'Liên hệ '].map((item) => (
                            <NavigationMenuItem key={item}>
                                <NavigationMenuLink
                                    href="#"
                                    className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                                >
                                    {item}
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>
                {/* Action Cart + Avatar */}
                <div className="flex items-center gap-6">
                    {/* Cart */}
                    <Link to={'/cart'} className="relative cursor-pointer">
                        <div className="relative cursor-pointer">
                            <ShoppingCart className="h-6 w-6 text-gray-700" />
                            <Badge className="absolute -right-2 -top-2 h-5 min-w-5 rounded-full px-1 text-xs">0</Badge>
                        </div>
                    </Link>

                    {/* User Avatar */}
                    {data_ui == null ? (
                        <Button variant="outline" onClick={() => navigate('/login')}>
                            Đăng nhập
                        </Button>
                    ) : (
                        <>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Avatar className="h-9 w-9 cursor-pointer">
                                        <AvatarImage src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREerhSiDbG9XVYKpGiPcsyzQQLb0v4GD111w&s" />
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem>Thông tin cá nhân</DropdownMenuItem>
                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={handleLogut}>
                                        Đăng xuất
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default header;
