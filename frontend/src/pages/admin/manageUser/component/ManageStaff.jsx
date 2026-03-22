import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { SelectContent, SelectItem, SelectTrigger, SelectValue, Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge as BadgeIcon, Box, Calendar, Eye, Layers, ListRestart, Loader, Mail, Plus, Tag } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'react-toastify';
import { Badge } from '@/components/ui/badge';

import { Pagination } from '@/components/public/pagination';

import { getUserStaff, updateUserStatus } from '@/services/account/account.api';

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
    // ==================== STATE ====================
    // URL & ROUTING STATE
    const [searchParams, setSearchParams] = useSearchParams();
    const filter = useMemo(
        () => ({
            search: searchParams.get('search') || '',
            status: searchParams.get('status') || 'all',
            sort: searchParams.get('sort') || 'newest',
            page: Number(searchParams.get('page')) || 1,
        }),
        [searchParams],
    );
    // DATA STATE
    const [dataUser, setDataUser] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    // UI STATE (Popups, Dialogs)
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // TEMPORARY STATE (Pending actions)

    // LOADING STATE
    const [loading, setLoading] = useState(false);
    const [loadingUpdateStatus, setLoadingUpdateStatus] = useState(false);
    // DERIVED STATE (Tính toán - XÓA state thừa)

    // ==================== USE EFFECT ====================
    // FETCH ONE TIME
    // FETCH MANY TIME
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                //console.log('Fetching customers with filter:', filter);
                const response = await getUserStaff(filter);
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
    const handleChangeSelectFilter = (value, filterName) => {
        setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);
            newParams.set(filterName, value);
            return newParams;
        });
    };
    const handleResetFilter = () => {
        setSearchParams({});
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
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-3">
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
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Trạng thái</SelectItem>
                            <SelectItem value="active">Hoat động</SelectItem>
                            <SelectItem value="inactive">Ngưng hoạt động</SelectItem>
                            <SelectItem value="banned">Bị cấm</SelectItem>
                        </SelectContent>
                    </Select>

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
                                    <TableHead className="font-semibold">Số sản phẩm đã tạo</TableHead>
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

                                            <TableCell className="font-medium">{user.userName}</TableCell>

                                            <TableCell>{user.email}</TableCell>

                                            <TableCell>{user.totalProducts}</TableCell>

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
                            <span className="text-sm text-muted-foreground">Tổng {totalItems} quản trị viên</span>
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
                    <div className="p-6 bg-white rounded-lg space-y-8">
                        {/* 1. Profile Header */}
                        <div className="flex flex-col items-center text-center space-y-3">
                            <div className="relative">
                                <Avatar className="h-24 w-24 border-4 border-slate-100 shadow-sm">
                                    <AvatarImage src={staffInfo.avatar} />
                                    <AvatarFallback>ST</AvatarFallback>
                                </Avatar>
                                <BadgeIcon className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-green-500 hover:bg-green-600 border-2 border-white">
                                    {staffInfo.status}
                                </BadgeIcon>
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
