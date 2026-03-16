import React from 'react';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { SelectContent, SelectItem, SelectTrigger, SelectValue, Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge, DollarSign, FileText, Filter, Plus, ShoppingBag } from 'lucide-react';
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
        ordersHandled: 5,
        revenueGenerated: 1200,
        avatar: 'https://i.pravatar.cc/150?img=1',
        status: 'Active',
    },
    {
        id: 2,
        name: 'Tran Thi B',
        email: 'thib@gmail.com',
        phone: '0987654322',
        ordersHandled: 3,
        revenueGenerated: 800,
        avatar: 'https://i.pravatar.cc/150?img=2',
        status: 'Disabled',
    },
    {
        id: 3,
        name: 'Le Van C',
        email: 'vanc@gmail.com',
        phone: '0987654323',
        ordersHandled: 7,
        revenueGenerated: 1500,
        avatar: 'https://i.pravatar.cc/150?img=3',
        status: 'Blocked',
    },
];
const salesInfo = {
    name: 'Nguyễn Văn Sale',
    email: 'sale.petech@gmail.com',
    avatar: 'https://i.pravatar.cc/150?u=sale1',
    role: 'Nhân viên bán hàng',
    joinedDate: '15/01/2026',
    // Chỉ tập trung vào số lượng tổng quát
    stats: {
        totalRevenue: '$12,450.00', // Tổng tiền tạo ra
        ordersHandled: 45, // Tổng số đơn đã xử lý
        totalBlogs: 8, // Tổng số bài viết đã viết
    },
};

const managedOrders = [
    { id: 'ORD-2026-001', customer: 'Trần Thi B', date: '14/03/2026', total: '$500', status: 'Completed' },
    { id: 'ORD-2026-015', customer: 'Lê Văn C', date: '15/03/2026', total: '$1,200', status: 'Processing' },
];

const blogList = [
    { id: 1, title: 'Đánh giá chi tiết RTX 5090 sắp ra mắt', date: '10/03/2026', views: '150' },
    { id: 2, title: 'Cách chọn nguồn (PSU) cho dàn máy Gaming', date: '01/03/2026', views: '320' },
];
const ManageSale = () => {
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
                <div className="flex gap-4 flex-wrap items-center justify-between">
                    {' '}
                    {/* Search Input */}
                    <div>
                        <Input placeholder="Search users..." className="h-9" />
                    </div>
                    {/* Status Filter */}
                    <Select>
                        <SelectTrigger className="h-9">
                            <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả trạng thái</SelectItem>
                            <SelectItem value="active">Hoạt động</SelectItem>
                            <SelectItem value="disabled">Tạm ngưng</SelectItem>
                            <SelectItem value="blocked">Đã chặn</SelectItem>
                        </SelectContent>
                    </Select>
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
                    {/* Filter theo Tổng tiền */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 gap-2 border-dashed">
                                <Filter className="h-4 w-4" />
                                <span>Số tiền tạo ra</span>
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
                                    <TableHead className="font-semibold">Số đơn đã xử lý</TableHead>
                                    <TableHead className="font-semibold">Số tiền tạo ra</TableHead>
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

                                        <TableCell>{user.ordersHandled}</TableCell>

                                        <TableCell>${user.revenueGenerated}</TableCell>

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
                    <div className="p-6 space-y-6 bg-slate-50">
                        {/* Header Info */}
                        <div className="flex items-center gap-4 bg-white p-6 rounded-xl border">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={salesInfo.avatar} />
                                <AvatarFallback>SALE</AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-xl font-bold">{salesInfo.name}</h2>
                                <p className="text-sm text-muted-foreground">{salesInfo.email}</p>
                                <Badge className="mt-1">Ngày vào làm: {salesInfo.joinedDate}</Badge>
                            </div>
                        </div>

                        {/* Stats Grid - 3 chỉ số môn học yêu cầu */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <CardContent className="pt-6 flex items-center gap-4">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <DollarSign className="text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Tổng tiền tạo ra</p>
                                        <p className="text-2xl font-bold">{salesInfo.stats.totalRevenue}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6 flex items-center gap-4">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <ShoppingBag className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Đơn đã xử lý</p>
                                        <p className="text-2xl font-bold">{salesInfo.stats.ordersHandled}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6 flex items-center gap-4">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <FileText className="text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Bài viết đã đăng</p>
                                        <p className="text-2xl font-bold">{salesInfo.stats.totalBlogs}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Tabs nội dung */}
                        <Tabs defaultValue="orders">
                            <TabsList>
                                <TabsTrigger value="orders">Đơn hàng đảm nhiệm</TabsTrigger>
                                <TabsTrigger value="blogs">Danh sách bài viết</TabsTrigger>
                            </TabsList>

                            <TabsContent value="orders" className="bg-white border rounded-lg mt-2">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Mã đơn</TableHead>
                                            <TableHead>Khách hàng</TableHead>
                                            <TableHead>Ngày xử lý</TableHead>
                                            <TableHead className="text-right">Tổng tiền</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {managedOrders.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-medium">{order.id}</TableCell>
                                                <TableCell>{order.customer}</TableCell>
                                                <TableCell>{order.date}</TableCell>
                                                <TableCell className="text-right font-semibold">
                                                    {order.total}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TabsContent>

                            <TabsContent value="blogs" className="space-y-2 mt-2">
                                {blogList.map((blog) => (
                                    <div
                                        key={blog.id}
                                        className="p-4 bg-white border rounded-lg flex justify-between items-center shadow-sm"
                                    >
                                        <div>
                                            <p className="font-medium">{blog.title}</p>
                                            <p className="text-xs text-muted-foreground">Ngày đăng: {blog.date}</p>
                                        </div>
                                        <Badge variant="secondary">{blog.views} lượt xem</Badge>
                                    </div>
                                ))}
                            </TabsContent>
                        </Tabs>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ManageSale;
