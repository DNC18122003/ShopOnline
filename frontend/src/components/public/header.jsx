import React from 'react';
import { Cpu, ShoppingCart } from 'lucide-react';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { Badge } from '../ui/badge';
import { Button } from '@/components/ui/button';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
const header = () => {
    const navigate = useNavigate();
    const user = localStorage.getItem('user');
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
                        {['Home', 'Products', 'About us', 'Support'].map((item) => (
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
                    <div className="relative cursor-pointer">
                        <ShoppingCart className="h-6 w-6 text-gray-700" />
                        <Badge className="absolute -right-2 -top-2 h-5 min-w-5 rounded-full px-1 text-xs">3</Badge>
                    </div>

                    {/* User Avatar */}
                    {user == null ? (
                        <Button variant="outline" onClick={() => navigate('/login')}>
                            Đăng nhập
                        </Button>
                    ) : (
                        <Avatar className="h-9 w-9 cursor-pointer">
                            <AvatarImage src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREerhSiDbG9XVYKpGiPcsyzQQLb0v4GD111w&s" />
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                    )}
                </div>
            </div>
        </header>
    );
};

export default header;
