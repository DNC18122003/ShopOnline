import React, { useEffect, useState } from 'react';

import { Badge, Calendar, Info, Mail, ShieldCheck } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { set } from 'date-fns';
import { getDetailAdmin } from '@/services/account/account.api';
import { toast } from 'react-toastify';

const adminInfo = {
    name: 'Nguyen Hoang Dan',
    email: 'dan.admin@techstore.com',
    avatar: 'https://github.com/shadcn.png',
    role: 'Quản trị viên hệ thống', // Hoặc "Super Admin"
    joinedDate: '20/10/2025',
    status: 'Active',
};
const DialogViewAdminDetail = ({ id }) => {
    console.log('Admin ID:', id);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            console.log('Fetching admin details for ID:', id);
            try {
                setLoading(true);
                const response = await getDetailAdmin(id);
                console.log('API Response:', response);
                setData(response.data);
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
        <div>
            <div className="p-8 bg-white space-y-8 max-w-2xl mx-auto">
                {/* Thông tin chính */}
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="relative">
                        <Avatar className="h-28 w-28 border-4 border-red-50 shadow-md">
                            <AvatarImage src={data.avatar ? data.avatar : null} />
                            <AvatarFallback>AD</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full border-2 border-white flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" />
                            ADMIN
                        </div>
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-slate-900">
                            {data?.userName ? data.userName : 'Admin'}
                        </h2>
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span className="text-sm">{data?.email}</span>
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
                            <span className="font-medium">{new Date(data?.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>

                        <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="text-sm text-slate-600 flex items-center gap-2">
                                <Info className="h-4 w-4" /> Trạng thái hoạt động
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>

                                {/* active, inactive, banned */}
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
                </div>

                <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg text-amber-800 text-xs leading-relaxed">
                    <strong>Lưu ý:</strong> Tài khoản Admin có quyền truy cập vào tất cả các module bao gồm Quản lý sản
                    phẩm, Đơn hàng và Cấu hình website. Vui lòng bảo mật thông tin đăng nhập.
                </div>
            </div>
        </div>
    );
};

export default DialogViewAdminDetail;

/*
Pah n trang */
