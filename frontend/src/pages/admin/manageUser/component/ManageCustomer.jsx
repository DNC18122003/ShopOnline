import React from 'react';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { SelectContent, SelectItem, SelectTrigger, SelectValue, Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge, CalendarDays, Filter, Package, PenTool, Plus, ShieldCheck } from 'lucide-react';
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
        orders: 5,
        totalSpent: 1200,
        avatar: 'https://i.pravatar.cc/150?img=1',
        status: 'Active',
    },
    {
        id: 2,
        name: 'Tran Thi B',
        email: 'thib@gmail.com',
        phone: '0987654322',
        orders: 3,
        totalSpent: 800,
        avatar: 'https://i.pravatar.cc/150?img=2',
        status: 'Disabled',
    },
    {
        id: 3,
        name: 'Le Van C',
        email: 'vanc@gmail.com',
        phone: '0987654323',
        orders: 7,
        totalSpent: 1500,
        avatar: 'https://i.pravatar.cc/150?img=3',
        status: 'Blocked',
    },
];
// Data fix cứng
const customer = {
    name: 'Nguyen Hoang Dan',
    email: 'dan.nguyen@example.com',
    phone: '0987654321',
    avatar: 'https://github.com/shadcn.png',
    rank: 'VIP - Gold',
    totalSpent: '$5,420.00',
    totalOrders: 12,
    joinDate: '20/10/2025',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    lastOrder: '10/03/2026',
    status: 'Active',
};

const orderHistory = [
    { id: 'ORD-001', date: '10/03/2026', total: '$2,100', status: 'Delivered', items: 'RTX 4090, Intel i9-14900K' },
    { id: 'ORD-045', date: '15/01/2026', total: '$150', status: 'Delivered', items: 'Chuột Logitech G502, Lót chuột' },
    {
        id: 'ORD-089',
        date: '12/12/2025',
        total: '$3,170',
        status: 'Delivered',
        items: 'Build PC Full Set - Workstation',
    },
];
const ManageCustomer = () => {
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
                {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-3"> */}
                <div className="flex gap-4 flex-wrap items-center justify-between">
                    {/* Search Input */}
                    <div>
                        <Input placeholder="Search users..." className="h-9" />
                    </div>

                    {/* Status Filter */}
                    <Select>
                        <SelectTrigger className="h-9">
                            <SelectValue placeholder="Trang thai" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Trang thai</SelectItem>
                            <SelectItem value="active">Hoat động</SelectItem>
                            <SelectItem value="disabled">Ngưng hoạt động</SelectItem>
                            <SelectItem value="blocked">Bị cấm</SelectItem>
                        </SelectContent>
                    </Select>
                    {/* Filter theo Tổng tiền */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 gap-2 border-dashed">
                                <Filter className="h-4 w-4" />
                                <span>Tổng chi tiêu</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-4" align="start">
                            <div className="space-y-4">
                                <h4 className="font-medium leading-none">Khoảng giá ($)</h4>
                                <div className="flex items-center gap-2">
                                    <Input type="number" placeholder="Min" className="h-8" />
                                    <span className="text-muted-foreground">-</span>
                                    <Input type="number" placeholder="Max" className="h-8" />
                                </div>
                                <Button size="sm" className="w-full">
                                    Áp dụng
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                    {/* --- Filter theo Số lượng đơn (Range) --- */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 gap-2 border-dashed">
                                <Filter className="h-4 w-4" />
                                <span>Số đơn hàng</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-4" align="start">
                            <div className="space-y-4">
                                <h4 className="font-medium leading-none">Số lượng đơn</h4>
                                <div className="flex items-center gap-2">
                                    <Input type="number" placeholder="Từ" className="h-8" />
                                    <span className="text-muted-foreground">-</span>
                                    <Input type="number" placeholder="Đến" className="h-8" />
                                </div>
                                <Button size="sm" className="w-full">
                                    Áp dụng
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Sort Dropdown */}
                    <Select>
                        <SelectTrigger className="w-[180px] h-9">
                            <SelectValue placeholder="Sắp xếp theo" />
                        </SelectTrigger>
                        <SelectContent>
                            {/* Nhóm Thời gian */}
                            <SelectItem value="newest">Mới nhất (Đăng ký)</SelectItem>
                            <SelectItem value="oldest">Cũ nhất</SelectItem>

                            {/* Nhóm Kinh doanh - QUAN TRỌNG NHẤT */}
                            <SelectItem value="spent-desc">Chi tiêu: Cao → Thấp</SelectItem>
                            <SelectItem value="spent-asc">Chi tiêu: Thấp → Cao</SelectItem>
                            <SelectItem value="orders-desc">Đơn hàng: Nhiều nhất</SelectItem>
                            <SelectItem value="orders-asc">Đơn hàng: Ít nhất</SelectItem>

                            {/* Nhóm Định danh */}
                            <SelectItem value="name-asc">Tên: A → Z</SelectItem>
                            <SelectItem value="name-desc">Tên: Z → A</SelectItem>
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
                                    <TableHead className="font-semibold">Số điện thoại</TableHead>
                                    <TableHead className="font-semibold">Tổng đơn</TableHead>
                                    <TableHead className="font-semibold">Tổng chi tiêu</TableHead>
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

                                        <TableCell>{user.phone}</TableCell>

                                        <TableCell>{user.orders}</TableCell>

                                        <TableCell>${user.totalSpent}</TableCell>

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
                    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
                        {/* Header Info */}
                        <div className="flex flex-col md:flex-row gap-6 items-start justify-between bg-white p-6 rounded-xl shadow-sm border">
                            <div className="flex gap-4 items-center">
                                <Avatar className="h-20 w-20 border-2 border-primary/20">
                                    <AvatarImage src={customer.avatar} />
                                    <AvatarFallback>DAN</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-muted-foreground">{customer.email}</p>
                                    <div className="flex gap-4 mt-2 text-sm">
                                        <span className="flex items-center gap-1">
                                            <CalendarDays className="h-4 w-4" /> Tham gia: {customer.joinDate}
                                        </span>
                                        <span className="flex items-center gap-1 text-green-600 font-medium">
                                            <ShieldCheck className="h-4 w-4" /> Tài khoản: {customer.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                                <Card className="bg-blue-50 border-none">
                                    <CardContent className="p-4 flex flex-col items-center justify-center">
                                        <p className="text-xs text-blue-600 font-semibold uppercase">Tổng chi tiêu</p>
                                        <p className="text-xl font-bold text-blue-900">{customer.totalSpent}</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-purple-50 border-none">
                                    <CardContent className="p-4 flex flex-col items-center justify-center">
                                        <p className="text-xs text-purple-600 font-semibold uppercase">Số đơn hàng</p>
                                        <p className="text-xl font-bold text-purple-900">{customer.totalOrders}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        <Tabs defaultValue="orders" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                                <TabsTrigger value="orders">Lịch sử đơn hàng</TabsTrigger>
                                <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
                            </TabsList>

                            {/* Tab 1: Orders */}
                            <TabsContent value="orders" className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Package className="h-5 w-5" /> Danh sách đơn hàng gần đây
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Mã đơn</TableHead>
                                                    <TableHead>Ngày đặt</TableHead>
                                                    <TableHead>Sản phẩm chính</TableHead>
                                                    <TableHead>Tổng tiền</TableHead>
                                                    <TableHead>Trạng thái</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {orderHistory.map((order) => (
                                                    <TableRow key={order.id}>
                                                        <TableCell className="font-medium text-blue-600 underline cursor-pointer">
                                                            {order.id}
                                                        </TableCell>
                                                        <TableCell>{order.date}</TableCell>
                                                        <TableCell className="max-w-[300px] truncate">
                                                            {order.items}
                                                        </TableCell>
                                                        <TableCell className="font-semibold">{order.total}</TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant="outline"
                                                                className="bg-green-50 text-green-700 border-green-200"
                                                            >
                                                                {order.status}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Tab 2: Profile Detail */}
                            <TabsContent value="profile" className="mt-4">
                                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Thông tin liên lạc</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-muted-foreground text-sm">Số điện thoại</span>
                                            <span className="font-medium">{customer.phone}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-muted-foreground text-sm">Địa chỉ mặc định</span>
                                            <span className="font-medium text-right">{customer.address}</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Sở thích mua sắm</CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex flex-wrap gap-2">
                                            <Badge variant="outline">Chuyên Build PC</Badge>
                                            <Badge variant="outline">Fan NVIDIA</Badge>
                                            <Badge variant="outline">Thanh toán trả góp</Badge>
                                            <Badge variant="outline">Khách hàng kỹ tính</Badge>
                                        </CardContent>
                                    </Card>
                                </div> */}
                            </TabsContent>
                        </Tabs>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ManageCustomer;
