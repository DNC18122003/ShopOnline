import React, { use, useEffect, useState } from 'react';

import { Badge, CalendarDays, Package, ShieldCheck } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getDetailAdmin, getDetailCustomer } from '@/services/account/account.api';
import { toast } from 'react-toastify';

const customer = {
    name: 'Nguyen Hoang Dan',
    email: 'dan.nguyen@example.com',
    phone: '0987654321',
    avatar: 'https://github.com/shadcn.png',
    rank: 'VIP - Gold',
    totalSpent: '$5,420.00',
    totalOrders: 12,
    joinDate: '20/10/2025',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    lastOrder: '10/03/2026',
    status: 'Active',
};

const orderHistory = [
    { id: 'ORD-001', date: '10/03/2026', total: '$2,100', status: 'Delivered', items: 'RTX 4090, Intel i9-14900K' },
    { id: 'ORD-045', date: '15/01/2026', total: '$150', status: 'Delivered', items: 'Chuột Logitech G502, Lót chuột' },
    {
        id: 'ORD-089',
        date: '12/12/2025',
        total: '$3,170',
        status: 'Delivered',
        items: 'Build PC Full Set - Workstation',
    },
];
const DialogViewCustomerDetail = ({ id }) => {
    console.log('Admin ID:', id);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            console.log('Fetching cus details for ID:', id);
            try {
                setLoading(true);
                const response = await getDetailCustomer(id);
                console.log('API Response:', response.data[0]);
                setData(response.data[0]);
            } catch (error) {
                toast.error('Không thể tải thông tin khách hàng. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48">
                <span>Loading...</span>
            </div>
        );
    }
    if (!data) {
        return (
            <div className="flex items-center justify-center h-48">
                <span>Không có dữ liệu admin</span>
            </div>
        );
    }
    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
            {/* Header Info */}
            <div className="flex flex-col md:flex-row gap-6 items-start justify-between bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex gap-4 items-center">
                    <Avatar className="h-20 w-20 border-2 border-primary/20">
                        <AvatarImage src={data.avatar} />
                        <AvatarFallback>CS</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-muted-foreground">{data.email}</p>
                        <div className="flex gap-4 mt-2 text-sm">
                            <span className="flex items-center gap-1">
                                <CalendarDays className="h-4 w-4" /> Tham gia:{' '}
                                {new Date(data.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                            {data.isActive === 'active' ? (
                                <span className="font-medium text-green-700">Hoạt động</span>
                            ) : data.isActive === 'inactive' ? (
                                <span className="font-medium text-red-700">Không hoạt động</span>
                            ) : (
                                <span className="font-medium text-gray-700">Bị cấm</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                    <Card className="bg-blue-50 border-none">
                        <CardContent className="p-4 flex flex-col items-center justify-center">
                            <p className="text-xs text-blue-600 font-semibold uppercase">Tổng chi tiêu</p>
                            <p className="text-xl font-bold text-blue-900">
                                {data.generatedAmount?.toLocaleString('vi-VN')} ₫
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-50 border-none">
                        <CardContent className="p-4 flex flex-col items-center justify-center">
                            <p className="text-xs text-purple-600 font-semibold uppercase">Số đơn hàng</p>
                            <p className="text-xl font-bold text-purple-900">{data.processedOrders}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Tabs defaultValue="orders" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-100">
                    <TabsTrigger value="orders">Lịch sử đơn hàng</TabsTrigger>
                    <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
                </TabsList>

                {/* Tab 1: Orders */}
                <TabsContent value="orders" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Package className="h-5 w-5" /> Danh sách đơn hàng gần đây
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mã đơn</TableHead>
                                        <TableHead>Ngày đặt</TableHead>
                                        <TableHead>Sản phẩm chính</TableHead>
                                        <TableHead>Tổng tiền</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {data.orders?.map((order) => (
                                        <TableRow key={order._id}>
                                            {/* Mã đơn */}
                                            <TableCell className="font-medium text-blue-600 underline cursor-pointer">
                                                {order.orderCode || order._id}
                                            </TableCell>

                                            {/* Ngày đặt */}
                                            <TableCell>
                                                {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                            </TableCell>

                                            {/* Sản phẩm chính */}
                                            <TableCell className="max-w-[300px] truncate">
                                                {order.items?.[0]?.nameSnapshot || 'Không có sản phẩm'}
                                            </TableCell>

                                            {/* Tổng tiền */}
                                            <TableCell className="font-semibold">
                                                {new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND',
                                                }).format(order.finalAmount)}
                                            </TableCell>

                                            {/* Trạng thái */}
                                            <TableCell>
                                                <span
                                                    className={`
                            ${order.orderStatus === 'hoàn thành' && 'bg-green-50 text-green-700 border-green-200'}
                            ${order.orderStatus === 'pending' && 'bg-yellow-50 text-yellow-700 border-yellow-200'}
                            ${order.orderStatus === 'shipping' && 'bg-blue-50 text-blue-700 border-blue-200'}
                        `}
                                                >
                                                    {order.orderStatus}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab 2: Profile Detail */}
                <TabsContent value="profile" className="mt-4">
                    {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Thông tin liên lạc</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground text-sm">Số điện thoại</span>
                                <span className="font-medium">{data.phone}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground text-sm">Tên đinh danh</span>
                                <span className="font-medium text-right">{data.userName}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground text-sm">Họ và tên</span>
                                <span className="font-medium text-right">
                                    {data.fullName ? data.fullName : 'chưa cập nhật'}
                                </span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground text-sm">Địa chỉ mặc định</span>
                                <span className="font-medium text-right">
                                    {[data.address?.street, data.address?.ward, data.address?.province]
                                        .filter(Boolean)
                                        .join(', ')}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default DialogViewCustomerDetail;
