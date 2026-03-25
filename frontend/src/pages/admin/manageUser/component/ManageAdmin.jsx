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
import DialogViewAdminDetail from './DialogViewAdminDetail';

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
    const [idDetail, setIdDetail] = useState('-1');
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
                //console.log('Response from API:', response);
                setDataUser(response.data);
                //console.log('List items:', response.data);
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
                                        <TableRow key={user.id} className="hover:bg-muted/50">
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

                                            <TableCell
                                                className="text-right"
                                                onClick={() => {
                                                    setIdDetail(user._id);
                                                    setIsDialogOpen(true);
                                                }}
                                            >
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
                <DialogContent>
                    <DialogViewAdminDetail id={idDetail} />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ManageAdmin;
