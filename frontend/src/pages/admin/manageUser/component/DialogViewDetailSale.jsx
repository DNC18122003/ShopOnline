import React, { useState, useMemo, useEffect } from 'react';

import { Badge as BadgeIcon, DollarSign, Eye, FileText, Filter, ListRestart, Loader, ShoppingBag } from 'lucide-react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getDetailAdmin, getDetailSales } from '@/services/account/account.api';
import { toast } from 'react-toastify';

const salesInfo = {
    email: 1,
    userName: 1,
    fullName: 1,
    phone: 1,
    avatar: 1,
    role: 1,
    createdAt: 1,
    isActive: 1,
    processedOrders: 1,
    generatedAmount: 1,
    totalBlogs: 1,
};

const DialogViewDetailSale = ({ id }) => {
    console.log('Sale ID:', id);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            console.log('Fetching admin details for ID:', id);
            try {
                setLoading(true);
                const response = await getDetailSales(id);
                console.log('API Response:', response.data[0]);
                setData(response.data[0]);
            } catch (error) {
                toast.error('Không thể tải thông tin admin. Vui lòng thử lại sau.');
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
        <div className="p-6 space-y-6 bg-slate-50">
            {/* 🔹 HEADER */}
            <div className="flex items-center gap-4 bg-white p-6 rounded-xl border shadow-sm">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={data.avatar} />
                    <AvatarFallback>{data.fullName?.charAt(0) || 'S'}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                    <h2 className="text-xl font-bold">{data.fullName}</h2>
                    <p className="text-sm text-muted-foreground">{data.email}</p>

                    <div className="flex items-center gap-3 mt-2 text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-md">{data.role}</span>

                        <span
                            className={`px-2 py-1 rounded-md ${
                                data.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                            }`}
                        >
                            {data.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
            </div>
            {/* Stats Grid - 3 chỉ số môn học yêu cầu */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card className="py-3">
                    <CardContent className="flex items-center gap-3 p-3">
                        <div className="p-2 bg-green-100 rounded-md">
                            <DollarSign className="text-green-600 w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Tổng tiền tạo ra</p>
                            <p className="text-lg font-semibold">{data.generatedAmount}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="py-3">
                    <CardContent className="flex items-center gap-3 p-3">
                        <div className="p-2 bg-blue-100 rounded-md">
                            <ShoppingBag className="text-blue-600 w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Đơn đã xử lý</p>
                            <p className="text-lg font-semibold">{data.processedOrders}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="py-3">
                    <CardContent className="flex items-center gap-3 p-3">
                        <div className="p-2 bg-purple-100 rounded-md">
                            <FileText className="text-purple-600 w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Bài viết đã đăng</p>
                            <p className="text-lg font-semibold">{data.totalBlogs}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
            {/* 🔹 DETAIL INFO */}
            <Card>
                <CardHeader>
                    <CardTitle>Thông tin chi tiết</CardTitle>
                </CardHeader>

                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">Username</p>
                        <p className="font-medium">{data.userName}</p>
                    </div>

                    <div>
                        <p className="text-muted-foreground">Số điện thoại</p>
                        <p className="font-medium">{data.phone}</p>
                    </div>

                    <div>
                        <p className="text-muted-foreground">Ngày tạo</p>
                        <p className="font-medium">{data.createdAt}</p>
                    </div>

                    <div>
                        <p className="text-muted-foreground">Trạng thái</p>
                        <p className="font-medium">{data.isActive ? 'Hoạt động' : 'Ngừng'}</p>
                    </div>
                </CardContent>
            </Card>
            {/* Tabs nội dung */}
            {/* <Tabs defaultValue="orders">
                <TabsList>
                    <TabsTrigger value="orders">Đơn hàng đảm nhiệm</TabsTrigger>
                    <TabsTrigger value="blogs">Danh sách bài viết</TabsTrigger>
                </TabsList> */}
            {/* <TabsContent value="orders" className="bg-white border rounded-lg mt-2">
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
                                    <TableCell className="text-right font-semibold">{order.total}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TabsContent> */}
            {/* <TabsContent value="blogs" className="space-y-2 mt-2">
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
            </Tabs> */}
        </div>
    );
};

export default DialogViewDetailSale;
