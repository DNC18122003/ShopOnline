import React, { useEffect, useState } from 'react';
import { Box, Calendar, Info, Mail, Phone, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getDetailStaff } from '@/services/account/account.api';
import { da } from 'date-fns/locale';

const staffInfo = {
    name: 'Lê Văn Staff',
    email: 'staff.inventory@techstore.com',
    userName: 'staff1',
    fullName: 'Lê Văn Staff',
    phone: '0123456789',
    avatar: 'https://i.pravatar.cc/150?u=staff3',
    role: 'Quản lý sản phẩm',
    joinedDate: '10/12/2025',
    status: 'active', // Sửa từ isActive thành status
    stats: {
        productsCreated: 125,
    },
};

const getStatusDisplay = (status) => {
    switch (status) {
        case 'active':
            return { text: 'Hoạt động', color: 'text-green-700', dot: 'bg-green-500 animate-pulse' };
        case 'inactive':
            return { text: 'Không hoạt động', color: 'text-red-700', dot: 'bg-red-500' };
        case 'banned':
        default:
            return { text: 'Bị cấm', color: 'text-gray-700', dot: 'bg-gray-500' };
    }
};
const DialogViewStaffDetail = ({ id }) => {
    //console.log('Staff ID:', id);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            //console.log('Fetching admin details for ID:', id);
            try {
                setLoading(true);
                const response = await getDetailStaff(id);
                //console.log('API Response:', response.data[0]);
                setData(response.data[0]);
            } catch (error) {
                toast.error('Không thể tải thông tin staff. Vui lòng thử lại sau.');
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
                <span>Không có dữ liệu quản trị viên</span>
            </div>
        );
    }
    // Hàm hỗ trợ render UI trạng thái linh hoạt

    const currentStatus = getStatusDisplay(data.isActive);

    return (
        <div className="p-6 bg-white rounded-lg space-y-8">
            {/* 1. Profile Header */}
            <div className="flex flex-col items-center text-center space-y-3">
                <div>
                    <Avatar className="h-24 w-24 border-4 border-slate-100 shadow-sm">
                        <AvatarImage src={data.avatar} />
                        <AvatarFallback>ST</AvatarFallback>
                    </Avatar>
                </div>
                <div>
                    {/* Sử dụng fullName thay vì name cho trang trọng */}
                    <h2 className="text-2xl font-bold text-slate-900">{data.fullName}</h2>
                    <p className="text-blue-600 font-medium">{data.role}</p>
                </div>

                {/* Trạng thái hoạt động */}
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-100 w-full">
                    <span className="text-sm text-slate-600 flex items-center gap-2">
                        <Info className="h-4 w-4" /> Trạng thái tài khoản
                    </span>
                    <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${currentStatus.dot}`}></span>
                        <span className={`font-medium ${currentStatus.color}`}>{currentStatus.text}</span>
                    </div>
                </div>

                {/* Thông tin liên hệ chi tiết (Thêm phone và userName) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600 bg-slate-50 rounded-lg border border-slate-100 w-full p-4 text-left">
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span className="truncate">{data.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span>{data.phone || 'Chua cap nhat'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <span>@{data.userName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span>Gia nhập: {new Date(data.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                </div>
            </div>

            <hr className="border-slate-100" />

            {/* 2. Stats Grid */}
            <div>
                {/* Sản phẩm */}
                <div className="flex flex-col items-center p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                    <div className="p-3 bg-blue-500 rounded-full mb-3 shadow-sm">
                        <Box className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-3xl font-black text-blue-700">{data.totalProducts}</span>
                    <span className="text-sm font-medium text-blue-600/80 uppercase tracking-wider mt-1">
                        Sản phẩm đã tạo
                    </span>
                </div>
            </div>

            <div className="pt-4 text-center">
                <p className="text-xs text-slate-400 italic">* Dữ liệu đóng góp tính đến ngày hôm nay</p>
            </div>
        </div>
    );
};

export default DialogViewStaffDetail;
