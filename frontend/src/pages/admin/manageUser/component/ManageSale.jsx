import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Badge as BadgeIcon, DollarSign, Eye, FileText, Filter, ListRestart, Loader, ShoppingBag } from 'lucide-react';

import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { SelectContent, SelectItem, SelectTrigger, SelectValue, Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'react-toastify';
import { Pagination } from '@/components/public/pagination';
import { getUserSale, updateUserStatus } from '@/services/account/account.api';
import { Badge } from '@/components/ui/badge';

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
    // ==================== STATE ====================
    // URL & ROUTING STATE
    const [searchParams, setSearchParams] = useSearchParams();
    const filter = useMemo(
        () => ({
            search: searchParams.get('search') || '',
            status: searchParams.get('status') || 'all',
            sort: searchParams.get('sort') || 'newest',
            page: Number(searchParams.get('page')) || 1,
            minGeneratedAmount: searchParams.get('min-generated-amount') || '',
            maxGeneratedAmount: searchParams.get('max-generated-amount') || '',
            fromOrders: searchParams.get('from-orders') || '',
            toOrders: searchParams.get('to-orders') || '',
        }),
        [searchParams],
    );
    // DATA STATE
    const [dataUser, setDataUser] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    // UI STATE
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // TEMPORAY STATE (Pending actions)

    // LOADING STATE
    const [loading, setLoading] = useState(false);
    const [loadingUpdateStatus, setLoadingUpdateStatus] = useState(false);

    // DERIVED STATE

    // ==================== USE EFFECT ====================
    // FETCH ONE TIME
    // FETCH MANY TIME
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                //console.log('Fetching customers with filter:', filter);
                const response = await getUserSale(filter);
                setDataUser(response.data);
                //console.log('Total pages from response:', response.pagination.totalItems);
                setTotalPages(Math.ceil(response.pagination.totalPages));
                setTotalItems(response.pagination.total);
                //console.log('Fetched customers:', response);
            } catch (error) {
                toast.error('Đã có lỗi xảy ra khi lấy dữ liệu khách hàng');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [filter]);

    // ==================== EVENT HANDLERS ====================
    // ---- PAGINATION & FILTER ----
    const handlePageChange = (page) => {
        setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);
            newParams.set('page', page);
            return newParams;
        });
    };
    const handleChangeInput = (e) => {
        // sử dụng useDebounce đoạn này
        setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);
            newParams.set(e.target.name, e.target.value);
            return newParams;
        });
    };
    const handleResetFilter = () => {
        setSearchParams({});
    };
    const handleChangeSelectFilter = (value, filterName) => {
        setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);
            newParams.set(filterName, value);
            return newParams;
        });
    };
    const handleToggleStatus = async (id, status) => {
        console.log('Toggle status for user with ID:', id, 'to new status:', status);
        try {
            setLoadingUpdateStatus(true);
            const response = await updateUserStatus(id, status);
            console.log('Response from updateUserStatus:', response);
            if (response.success) {
                toast.success('Cập nhật trạng thái người dùng thành công');
                // Cập nhật trạng thái người dùng trong dataUser để UI phản ánh ngay lập tức
                setDataUser((prevData) =>
                    prevData.map((user) => (user._id === id ? { ...user, isActive: status } : user)),
                );
            }
        } catch (error) {
            console.log('error loi r', error.response?.data?.message);
            toast.error(error.response?.data?.message || 'Đã có lỗi xảy ra khi cập nhật trạng thái người dùng');
        } finally {
            setLoadingUpdateStatus(false);
        }
    };

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
                    {/* Search Input */}
                    <div>
                        <Input
                            placeholder="Tìm kiếm theo tên..."
                            className="h-9"
                            name="search"
                            value={filter.search}
                            onChange={handleChangeInput}
                        />
                    </div>
                    {/* Status Filter */}
                    <Select
                        value={filter.status || 'all'}
                        onValueChange={(value) => {
                            // console.log('value:', value);
                            handleChangeSelectFilter(value, 'status');
                        }}
                    >
                        <SelectTrigger className="h-9">
                            <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Trạng thái</SelectItem>
                            <SelectItem value="active">Hoat động</SelectItem>
                            <SelectItem value="inactive">Ngưng hoạt động</SelectItem>
                            <SelectItem value="banned">Bị cấm</SelectItem>
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
                                    <Input
                                        type="number"
                                        placeholder="Từ"
                                        className="h-8"
                                        name="from-orders"
                                        value={filter.fromOrders}
                                        onChange={handleChangeInput}
                                    />
                                    <span className="text-muted-foreground">-</span>
                                    <Input
                                        type="number"
                                        placeholder="Đến"
                                        className="h-8"
                                        name="to-orders"
                                        value={filter.toOrders}
                                        onChange={handleChangeInput}
                                    />
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
                                    <Input
                                        type="number"
                                        placeholder="Min"
                                        className="h-8"
                                        name="min-generated-amount"
                                        value={filter.minGeneratedAmount}
                                        onChange={handleChangeInput}
                                    />
                                    <span className="text-muted-foreground">-</span>
                                    <Input
                                        type="number"
                                        placeholder="Max"
                                        className="h-8"
                                        name="max-generated-amount"
                                        value={filter.maxGeneratedAmount}
                                        onChange={handleChangeInput}
                                    />
                                </div>
                                <Button size="sm" className="w-full">
                                    Áp dụng
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                    {/* Sort Dropdown */}
                    <Select
                        value={filter.sort || 'newest'}
                        onValueChange={(value) => {
                            handleChangeSelectFilter(value, 'sort');
                        }}
                    >
                        <SelectTrigger className="w-45 h-9">
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
                    {/* Reset filter */}
                    <Button className="gap-2" size="sm" variant="outline" onClick={handleResetFilter}>
                        <ListRestart className="h-4 w-4" />
                        <span classame="hidden sm:inline">Cài đặt lại</span>
                    </Button>
                </div>
                <div className="space-y-4">
                    <div className="overflow-x-auto rounded-lg border border-border">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="font-semibold">Avatar</TableHead>
                                    <TableHead className="font-semibold">Email</TableHead>
                                    <TableHead className="font-semibold">Tên nhân viên</TableHead>
                                    <TableHead className="font-semibold">Số điện thoại</TableHead>
                                    <TableHead className="font-semibold">Số đơn đã xử lý</TableHead>
                                    <TableHead className="font-semibold">Số tiền tạo ra</TableHead>
                                    <TableHead className="font-semibold">Trạng thái</TableHead>
                                    <TableHead className="font-semibold text-right">Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            {loading ? (
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center">
                                            <Loader />
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            ) : (
                                <TableBody>
                                    {dataUser.map((user) => (
                                        <TableRow
                                            key={user.id}
                                            className="hover:bg-muted/50"
                                            onClick={() => setOpenDialogDetail(true)}
                                        >
                                            <TableCell>
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={user.avatar} />
                                                    <AvatarFallback>{getInitials(user.userName)}</AvatarFallback>
                                                </Avatar>
                                            </TableCell>

                                            <TableCell>{user.email}</TableCell>

                                            <TableCell className="font-medium">{user.userName}</TableCell>

                                            <TableCell>{user.phone || 'Chưa cập nhật'}</TableCell>

                                            <TableCell>{user.processedOrders}</TableCell>

                                            <TableCell>${user.generatedAmount}</TableCell>

                                            <TableCell>
                                                <Select
                                                    value={user.isActive}
                                                    className="border-0"
                                                    onValueChange={(value) => handleToggleStatus(user._id, value)}
                                                >
                                                    <SelectTrigger className="h-9 border-0">
                                                        <SelectValue placeholder="Trạng thái" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="active">
                                                            <Badge className="bg-green-500">Hoạt động</Badge>
                                                        </SelectItem>
                                                        <SelectItem value="inactive">
                                                            <Badge className="bg-red-500">Ngưng hoạt động</Badge>
                                                        </SelectItem>
                                                        <SelectItem value="banned">
                                                            <Badge className="bg-gray-500">Bị cấm</Badge>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>

                                            <TableCell className="text-center">
                                                <Button variant="ghost" size="sm" onClick={() => setIsDialogOpen(true)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            )}
                        </Table>
                    </div>
                    {/* Pagination */}
                    {loading ? null : (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Tổng {totalItems} nhân viên</span>
                            <Pagination
                                currentPage={filter.page}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                                <BadgeIcon className="mt-1">Ngày vào làm: {salesInfo.joinedDate}</BadgeIcon>
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
                                        <BadgeIcon variant="secondary">{blog.views} lượt xem</BadgeIcon>
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
