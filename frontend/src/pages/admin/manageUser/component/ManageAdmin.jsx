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
const ManageAdmin = () => {
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
                                <TableHead className="font-semibold">Ngày tạo</TableHead>
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
    );
};

export default ManageAdmin;
