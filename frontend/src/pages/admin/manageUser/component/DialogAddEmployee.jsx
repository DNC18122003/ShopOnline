import React, { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DialogAddEmployee = () => {
    const [password, setPassword] = useState('');

    // Hàm tạo mật khẩu chỉ chạy khi admin bấm nút
    const generatePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let newPassword = '';
        for (let i = 0; i < 10; i++) {
            newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPassword(newPassword);
    };

    return (
        <>
            <DialogHeader>
                <DialogTitle>Thêm nhân viên</DialogTitle>
                <DialogDescription>Tạo tài khoản nội bộ cho nhân viên cửa hàng linh kiện.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
                {/* Full Name */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="fullName" className="text-right">
                        Họ và tên
                    </Label>
                    <Input id="fullName" placeholder="Ví dụ: Nguyễn Văn A" className="col-span-3" />
                </div>

                {/* Email */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                        Email
                    </Label>
                    <Input id="email" type="email" placeholder="nhanvien@gearshop.vn" className="col-span-3" />
                </div>

                {/* Role */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">
                        Vị trí
                    </Label>
                    <div className="col-span-3">
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn vai trò" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="manager">Quản lý cửa hàng</SelectItem>
                                <SelectItem value="sales">Nhân viên Sales (Bán hàng)</SelectItem>
                                <SelectItem value="technical">Kỹ thuật viên (Build PC/Sửa chữa)</SelectItem>
                                <SelectItem value="warehouse">Thủ kho</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Password (Chỉ render khi bấm nút) */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">
                        Mật khẩu
                    </Label>
                    <div className="col-span-3 flex gap-2">
                        <Input
                            id="password"
                            value={password}
                            placeholder="Bấm tạo mật khẩu..."
                            readOnly
                            className="flex-1 bg-muted font-mono"
                        />
                        <Button type="button" variant="secondary" onClick={generatePassword}>
                            <KeyRound className="h-4 w-4 mr-2" />
                            Tạo MK
                        </Button>
                    </div>
                </div>
            </div>

            <DialogFooter>
                <Button type="submit">Lưu thông tin</Button>
            </DialogFooter>
        </>
    );
};

export default DialogAddEmployee;
