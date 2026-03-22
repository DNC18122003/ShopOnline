import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Eye, Filter, ListRestart, Loader } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SelectContent, SelectItem, SelectTrigger, SelectValue, Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent } from '@/components/ui/dialog';

import { toast } from 'react-toastify';

import { getListAccount, updateUserStatus } from '@/services/account/account.api';
import DialogViewCustomerDetail from './DialogViewCustomerDetail';
import { Pagination } from '@/components/public/pagination';
import { Badge } from '@/components/ui/badge';

const ManageCustomer = () => {
    // ==================== STATE ====================
    // URL & ROUTING STATE
    const [searchParams, setSearchParams] = useSearchParams();
    const filter = useMemo(
        () => ({
            search: searchParams.get('search') || '',
            status: searchParams.get('status') || 'all',
            sort: searchParams.get('sort') || 'newest',
            page: Number(searchParams.get('page')) || 1,
            fromPrice: searchParams.get('from-price') || '',
            toPrice: searchParams.get('to-price') || '',
            fromOrders: searchParams.get('from-orders') || '',
            toOrders: searchParams.get('to-orders') || '',
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
                const response = await getListAccount(filter);
                setDataUser(response.data);
                console.log('Total pages from response:', response.data);
                setTotalPages(Math.ceil(response.pagination.totalItems / 9));
                setTotalItems(response.pagination.totalItems);
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
    // ---- USER ACTIONS ----

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
                {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-3"> */}
                <div className="flex gap-4 flex-wrap items-center justify-between">
                    {/* Search Input */}
                    <div>
                        <Input
                            placeholder="Tìm kiếm theo tên ..."
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
                                {/* <Button size="sm" className="w-full">
                                    Áp dụng
                                </Button> */}
                            </div>
                        </PopoverContent>
                    </Popover>
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
                                    <Input
                                        type="number"
                                        placeholder="Min"
                                        className="h-8"
                                        name="from-price"
                                        value={filter.fromPrice}
                                        onChange={handleChangeInput}
                                    />
                                    <span className="text-muted-foreground">-</span>
                                    <Input
                                        type="number"
                                        placeholder="Max"
                                        className="h-8"
                                        name="to-price"
                                        value={filter.toPrice}
                                        onChange={handleChangeInput}
                                    />
                                </div>
                                {/* <Button size="sm" className="w-full">
                                    Áp dụng
                                </Button> */}
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
                                    <TableHead className="font-semibold">Tên người dùng</TableHead>
                                    <TableHead className="font-semibold">Số điện thoại</TableHead>
                                    <TableHead className="font-semibold">Tổng đơn</TableHead>
                                    <TableHead className="font-semibold">Tổng chi tiêu</TableHead>
                                    <TableHead className="font-semibold">Trạng thái</TableHead>
                                    <TableHead className="font-semibold text-right">Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            {/*  */}
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
                                        <TableRow key={user._id} className="hover:bg-muted/50">
                                            <TableCell>
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={user.avatar} />
                                                    <AvatarFallback>{getInitials(user.userName)}</AvatarFallback>
                                                </Avatar>
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell className="font-medium">{user.userName}</TableCell>

                                            <TableCell>{user.phone || 'Chưa cung cấp'}</TableCell>

                                            <TableCell>{user.sumOrders}</TableCell>

                                            <TableCell>${user.totalSpent}</TableCell>

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
                            <span className="text-sm text-muted-foreground">Tổng {totalItems} khách hàng</span>
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
                <DialogContent className="sm:max-w-225 llg:max-w-275 w-[95vw] max-h-[90vh] overflow-y-auto p-0">
                    <DialogViewCustomerDetail id={1} />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ManageCustomer;
