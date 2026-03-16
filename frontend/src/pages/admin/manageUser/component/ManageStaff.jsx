import React from 'react';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { SelectContent, SelectItem, SelectTrigger, SelectValue, Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge, Box, Calendar, Layers, Mail, Plus, Tag } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
const data = [
    {
        id: 1,
        name: 'Nguyen Van A',
        email: 'vana@gmail.com',
        phone: '0987654321',
        createdProduct: 5, // Số sản phẩm đã tạo
        createdBrand: 3, // Số thương hiệu đã tạo
        createdCategory: 4, // Số danh mục đã tạo
        avatar: 'https://i.pravatar.cc/150?img=1',
        status: 'Active',
    },
    {
        id: 2,
        name: 'Tran Thi B',
        email: 'thib@gmail.com',
        phone: '0987654322',
        createdProduct: 8,
        createdBrand: 2,
        createdCategory: 5,

        avatar: 'https://i.pravatar.cc/150?img=2',
        status: 'Disabled',
    },
    {
        id: 3,
        name: 'Le Van C',
        email: 'vanc@gmail.com',
        phone: '0987654323',
        createdProduct: 12,
        createdBrand: 6,
        createdCategory: 7,

        avatar: 'https://i.pravatar.cc/150?img=3',
        status: 'Blocked',
    },
];
const staffInfo = {
    name: 'Lê Văn Staff',
    email: 'staff.inventory@techstore.com',
    avatar: 'https://i.pravatar.cc/150?u=staff3',
    role: 'Quản lý sản phẩm',
    joinedDate: '10/12/2025',
    status: 'Active',
    stats: {
        productsCreated: 125,
        categoriesCreated: 12,
        brandsCreated: 8,
    },
};
const ManageStaff = () => {
    const [showAddButton, setShowAddButton] = useState(true);
    const [openDialogDetail, setOpenDialogDetail] = useState(false);
    const getInitials = (name) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };
    return (
        <div>
            <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 md:gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-3">
                    {/* Search Input */}
                    <div>
                        <Input placeholder="Search users..." className="h-9" />
                    </div>

                    {/* Status Filter */}
                    <Select>
                        <SelectTrigger className="h-9">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="disabled">Disabled</SelectItem>
                            <SelectItem value="blocked">Blocked</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Sort Dropdown */}
                    <Select>
                        <SelectTrigger className="h-9">
                            <SelectValue placeholder="Sort" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                            <SelectItem value="name-asc">Name A-Z</SelectItem>
                            <SelectItem value="name-desc">Name Z-A</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Add User Button */}
                    {showAddButton && (
                        <Button className="gap-2" size="sm">
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Add User</span>
                        </Button>
                    )}
                </div>
                <div className="space-y-4">
                    <div className="overflow-x-auto rounded-lg border border-border">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="font-semibold">Avatar</TableHead>
                                    <TableHead className="font-semibold">Tên</TableHead>
                                    <TableHead className="font-semibold">Email</TableHead>
                                    <TableHead className="font-semibold">Số sản phẩm đã tạo</TableHead>
                                    <TableHead className="font-semibold">Số thương hiệu đã tạo</TableHead>
                                    <TableHead className="font-semibold">Số danh mục đã tạo</TableHead>
                                    <TableHead className="font-semibold">Trạng thái</TableHead>
                                    <TableHead className="font-semibold text-right">Hành động</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {data.map((user) => (
                                    <TableRow
                                        key={user.id}
                                        className="hover:bg-muted/50"
                                        onClick={() => setOpenDialogDetail(true)}
                                    >
                                        <TableCell>
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={user.avatar} />
                                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                            </Avatar>
                                        </TableCell>

                                        <TableCell className="font-medium">{user.name}</TableCell>

                                        <TableCell>{user.email}</TableCell>

                                        <TableCell>{user.createdProduct}</TableCell>

                                        <TableCell>{user.createdBrand}</TableCell>

                                        <TableCell>{user.createdCategory}</TableCell>

                                        <TableCell>
                                            <span
                                                className={`text-sm ${user.status === 'Active' ? 'text-green-500' : user.status === 'Disabled' ? 'text-gray-500' : 'text-red-500'}`}
                                            >
                                                {user.status}
                                            </span>
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm">
                                                Edit
                                            </Button>
                                            <Button variant="destructive" size="sm" className="ml-2">
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
            <Dialog open={openDialogDetail} onOpenChange={setOpenDialogDetail}>
                <DialogContent className="sm:max-w-[900px] lg:max-w-[1100px] w-[95vw] max-h-[90vh] overflow-y-auto p-0">
                    <div className="p-6 bg-white rounded-lg space-y-8">
                        {/* 1. Profile Header */}
                        <div className="flex flex-col items-center text-center space-y-3">
                            <div className="relative">
                                <Avatar className="h-24 w-24 border-4 border-slate-100 shadow-sm">
                                    <AvatarImage src={staffInfo.avatar} />
                                    <AvatarFallback>ST</AvatarFallback>
                                </Avatar>
                                <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-green-500 hover:bg-green-600 border-2 border-white">
                                    {staffInfo.status}
                                </Badge>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">{staffInfo.name}</h2>
                                <p className="text-blue-600 font-medium">{staffInfo.role}</p>
                            </div>

                            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground pt-2">
                                <div className="flex items-center gap-1">
                                    <Mail className="h-4 w-4" />
                                    {staffInfo.email}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    Gia nhập: {staffInfo.joinedDate}
                                </div>
                            </div>
                        </div>

                        <hr className="border-slate-100" />

                        {/* 2. Stats Grid - Trọng tâm là phần này */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Sản phẩm */}
                            <div className="flex flex-col items-center p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                                <div className="p-3 bg-blue-500 rounded-full mb-3 shadow-sm">
                                    <Box className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-3xl font-black text-blue-700">
                                    {staffInfo.stats.productsCreated}
                                </span>
                                <span className="text-sm font-medium text-blue-600/80 uppercase tracking-wider mt-1">
                                    Sản phẩm
                                </span>
                            </div>

                            {/* Thương hiệu */}
                            <div className="flex flex-col items-center p-4 rounded-xl bg-purple-50/50 border border-purple-100">
                                <div className="p-3 bg-purple-500 rounded-full mb-3 shadow-sm">
                                    <Tag className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-3xl font-black text-purple-700">
                                    {staffInfo.stats.brandsCreated}
                                </span>
                                <span className="text-sm font-medium text-purple-600/80 uppercase tracking-wider mt-1">
                                    Thương hiệu
                                </span>
                            </div>

                            {/* Danh mục */}
                            <div className="flex flex-col items-center p-4 rounded-xl bg-amber-50/50 border border-amber-100">
                                <div className="p-3 bg-amber-500 rounded-full mb-3 shadow-sm">
                                    <Layers className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-3xl font-black text-amber-700">
                                    {staffInfo.stats.categoriesCreated}
                                </span>
                                <span className="text-sm font-medium text-amber-600/80 uppercase tracking-wider mt-1">
                                    Danh mục
                                </span>
                            </div>
                        </div>

                        <div className="pt-4 text-center">
                            <p className="text-xs text-slate-400 italic">* Dữ liệu đóng góp tính đến ngày hôm nay</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ManageStaff;
