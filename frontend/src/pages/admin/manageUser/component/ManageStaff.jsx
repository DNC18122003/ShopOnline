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

import { getUserStaff, updateEmployeeStatus } from '@/services/account/account.api';
import DialogViewStaffDetail from './DialogViewStaffDetail';

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
    const [idDetail, setIdDetail] = useState('-1');
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
            const response = await updateEmployeeStatus(id, status);
            console.log('Response from updateEmployeeStatus:', response);
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
    const renderVietNameseRegion = (region) => {
        switch (region) {
            case 'north':
                return 'Phía Bắc';
            case 'central':
                return 'Miền Trung';
            case 'south':
                return 'Phía Nam';
            default:
                return 'Chưa cập nhật';
        }
    };
    const getRegionStyle = (region) => {
        switch (region) {
            case 'north':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'central':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'south':
                return 'bg-green-50 text-green-700 border-green-200';
            default:
                return 'bg-gray-50 text-gray-500 border-gray-200';
        }
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
                                    <TableHead className="w-[60px]">Avatar</TableHead>
                                    <TableHead className="w-[180px]">Tên nhân viên</TableHead>
                                    <TableHead className="min-w-[220px]">Email</TableHead>
                                    <TableHead className="w-[140px]">Số SP</TableHead>
                                    <TableHead className="w-[160px]">Trạng thái</TableHead>
                                    <TableHead className="w-[160px]">Khu vực</TableHead>
                                    <TableHead className="w-[80px] text-center">Hành động</TableHead>
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

                                            <TableCell>
                                                <span
                                                    className={`px-2 py-1 text-xs font-medium rounded-md border ${getRegionStyle(
                                                        user.regionManaged,
                                                    )}`}
                                                >
                                                    {renderVietNameseRegion(user.regionManaged)}
                                                </span>
                                            </TableCell>

                                            <TableCell className="text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setIdDetail(user._id);
                                                        setIsDialogOpen(true);
                                                    }}
                                                >
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
                <DialogContent>
                    <DialogViewStaffDetail id={idDetail} />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ManageStaff;
