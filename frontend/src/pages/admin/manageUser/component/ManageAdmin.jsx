import React from 'react';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { SelectContent, SelectItem, SelectTrigger, SelectValue, Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge, Calendar, Info, Mail, Plus, ShieldCheck } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent } from '@/components/ui/dialog';

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
                                    <TableHead className="font-semibold">Ngày tạo</TableHead>
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

                                        <TableCell>{user.account}</TableCell>

                                        <TableCell>{user.createdAt}</TableCell>

                                        <TableCell className="text-right">
                                            <span>Xem thông tin</span>
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
