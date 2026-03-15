import React from 'react';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { SelectContent, SelectItem, SelectTrigger, SelectValue, Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
const ManageSale = () => {
    const [showAddButton, setShowAddButton] = useState(true);
    const getInitials = (name) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };
    return (
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
                                <TableHead className="font-semibold">Số điện thoại</TableHead>
                                <TableHead className="font-semibold">Số đơn đã xử lý</TableHead>
                                <TableHead className="font-semibold">Số tiền tạo ra</TableHead>
                                <TableHead className="font-semibold">Trạng thái</TableHead>
                                <TableHead className="font-semibold text-right">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {data.map((user) => (
                                <TableRow key={user.id} className="hover:bg-muted/50">
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
    );
};

export default ManageSale;
