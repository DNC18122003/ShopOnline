import React, { useEffect, useMemo } from 'react';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { SelectContent, SelectItem, SelectTrigger, SelectValue, Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge, Calendar, Info, ListRestart, Loader, Mail, Plus, ShieldCheck } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getUserAdmin } from '@/services/account/account.api';
import { Pagination } from '@/components/public/pagination';

const data = [
    {
        id: 1,
        name: 'Nguyen Van A',
        account: 'vana@gmail.com',
        createdAt: '2023-09-01',
    },
    {
        id: 2,
        name: 'Tran Thi B',
        account: 'thib@gmail.com',
        createdAt: '2023-09-05',
    },
    {
        id: 3,
        name: 'Le Van C',
        account: 'vanc@gmail.com',
        createdAt: '2023-09-10',
    },
];
const adminInfo = {
    name: 'Nguyen Hoang Dan',
    email: 'dan.admin@techstore.com',
    avatar: 'https://github.com/shadcn.png',
    role: 'Quản trị viên hệ thống', // Hoặc "Super Admin"
    joinedDate: '20/10/2025',
    status: 'Active',
};
const ManageAdmin = () => {
    // ==================== STATE ====================
    // URL & ROUTING STATE
    const [searchParams, setSearchParams] = useSearchParams();
    const filter = useMemo(
        () => ({
            search: searchParams.get('search') || '',
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

    // DERIVED STATE (Tính toán - XÓA state thừa)

    // ==================== USE EFFECT ====================
    // FETCH ONE TIME
    // FETCH MANY TIME
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                //console.log('Fetching customers with filter:', filter);
                const response = await getUserAdmin(filter);
                console.log('Response from API:', response);
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
                            placeholder="Search users..."
                            className="h-9"
                            name="search"
                            value={filter.search}
                            onChange={handleChangeInput}
                        />
                    </div>

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
                                    <TableHead className="font-semibold">Tên</TableHead>
                                    <TableHead className="font-semibold">Email</TableHead>
                                    <TableHead className="font-semibold">Ngày tạo</TableHead>
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
                                            onClick={() => setIsDialogOpen(true)}
                                        >
                                            <TableCell>
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={user.avatar} />
                                                    <AvatarFallback>{getInitials(user.userName)}</AvatarFallback>
                                                </Avatar>
                                            </TableCell>

                                            <TableCell className="font-medium">{user.userName}</TableCell>

                                            <TableCell>{user.email}</TableCell>

                                            <TableCell>
                                                {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                            </TableCell>

                                            <TableCell className="text-right">
                                                <span>Xem thông tin</span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            )}
                        </Table>
                    </div>
                    {loading ? null : (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Tổng {totalItems} admin</span>
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
                    <div className="p-8 bg-white space-y-8 max-w-2xl mx-auto">
                        {/* Thông tin chính */}
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="relative">
                                <Avatar className="h-28 w-28 border-4 border-red-50 shadow-md">
                                    <AvatarImage src={adminInfo.avatar} />
                                    <AvatarFallback>AD</AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full border-2 border-white flex items-center gap-1">
                                    <ShieldCheck className="h-3 w-3" />
                                    ADMIN
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h2 className="text-2xl font-bold text-slate-900">{adminInfo.name}</h2>
                                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                    <span className="text-sm">{adminInfo.email}</span>
                                </div>
                            </div>
                        </div>

                        <hr className="border-slate-100" />

                        {/* Thông tin chi tiết */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                <Info className="h-4 w-4" /> Chi tiết tài khoản
                            </h3>

                            <div className="grid grid-cols-1 gap-3">
                                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <span className="text-sm text-slate-600 flex items-center gap-2">
                                        <Calendar className="h-4 w-4" /> Ngày khởi tạo
                                    </span>
                                    <span className="font-medium">{adminInfo.joinedDate}</span>
                                </div>

                                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <span className="text-sm text-slate-600 flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4" /> Cấp độ truy cập
                                    </span>
                                    <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50">
                                        Toàn quyền hệ thống
                                    </Badge>
                                </div>

                                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <span className="text-sm text-slate-600 flex items-center gap-2">
                                        <Info className="h-4 w-4" /> Trạng thái hoạt động
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                                        <span className="font-medium text-green-700">{adminInfo.status}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg text-amber-800 text-xs leading-relaxed">
                            <strong>Lưu ý:</strong> Tài khoản Admin có quyền truy cập vào tất cả các module bao gồm Quản
                            lý sản phẩm, Đơn hàng và Cấu hình website. Vui lòng bảo mật thông tin đăng nhập.
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ManageAdmin;
