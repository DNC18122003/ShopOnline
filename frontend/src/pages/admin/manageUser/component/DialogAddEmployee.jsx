import React, { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-toastify';
import { createNewEmployee } from '@/services/account/account.api';

const DialogAddEmployee = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        role: '',
        password: '',
        regionManaged: '',
    });
    const [errorMessage, setErrorMessage] = useState({
        fullName: '',
        email: '',
        role: '',
        password: '',
        regionManaged: '',
    });
    const [loading, setLoading] = useState(false);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Hàm tạo mật khẩu chỉ chạy khi admin bấm nút
    const generatePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let newPassword = '';
        for (let i = 0; i < 10; i++) {
            newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData((prevData) => ({
            ...prevData,
            password: newPassword,
        }));
    };
    const validateForm = (form) => {
        const errors = {};
        if (!form.fullName.trim()) {
            errors.fullName = 'Họ và tên không được để trống';
        }
        if (!form.email.trim()) {
            errors.email = 'Email không được để trống';
        }
        if (!form.role.trim()) {
            errors.role = 'Vị trí không được để trống';
        }
        if (!form.password.trim()) {
            errors.password = 'Mật khẩu không được để trống';
        }
        if (!form.role.trim() == 'staff' && !form.regionManaged.trim()) {
            errors.regionManaged = 'Khu vực quản lý không được để trống';
        }
        return errors;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        // validate form data
        const errors = validateForm(formData);
        if (Object.keys(errors).length > 0) {
            setErrorMessage(errors);
            return;
        }
        try {
            //console.log('Submitting form data:', formData);
            setLoading(true);
            // validate data
            const formDataParsed = {
                fullName: formData.fullName.trim(),
                email: formData.email.trim().toLowerCase(),
                password: formData.password.trim(),
                role: formData.role.trim().toLowerCase(),
                regionManaged: formData.regionManaged ? formData.regionManaged.trim().toLowerCase() : null,
            };
            const response = await createNewEmployee(formDataParsed);
            if (response.success) {
                toast.success('Nhân viên mới đã được tạo thành công!');
                // reset form
                setFormData({
                    fullName: '',
                    email: '',
                    role: '',
                    password: '',
                    regionManaged: '',
                });
                setErrorMessage({
                    fullName: '',
                    email: '',
                    role: '',
                    password: '',
                    regionManaged: '',
                });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi khi tạo nhân viên mới. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <DialogHeader>
                <DialogTitle>Thêm nhân viên</DialogTitle>
                <DialogDescription>Tạo tài khoản nội bộ cho nhân viên</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
                {/* Full Name */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="fullName" className="text-right">
                        Họ và tên
                    </Label>
                    <Input
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Ví dụ: Nguyễn Văn A"
                        className="col-span-3"
                    />
                </div>
                {errorMessage.fullName && <p className="text-sm text-red-500">{errorMessage.fullName}</p>}
                {/* Email */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                        Email
                    </Label>
                    <Input
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        type="email"
                        placeholder="nhanvien@techshop.vn"
                        className="col-span-3"
                    />
                </div>
                {errorMessage.email && <p className="text-sm text-red-500 ">{errorMessage.email}</p>}

                {/* Role */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">
                        Vị trí
                    </Label>
                    <div className="col-span-3">
                        <Select
                            name="role"
                            value={formData.role || ''}
                            onValueChange={(value) => setFormData((prevData) => ({ ...prevData, role: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn vai trò" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="staff">Quản lý cửa hàng</SelectItem>
                                <SelectItem value="sale">Nhân viên Sales (Bán hàng)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                {errorMessage.role && <p className="text-sm text-red-500 ">{errorMessage.role}</p>}
                {formData.role === 'staff' && (
                    <>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="regionManaged" className="text-right">
                                Khu vực quản lý
                            </Label>
                            <div className="col-span-3">
                                <Select
                                    name="regionManaged"
                                    value={formData.regionManaged || ''}
                                    onValueChange={(value) =>
                                        setFormData((prevData) => ({ ...prevData, regionManaged: value }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn khu vực quản lý" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="nouth">Phía Nam</SelectItem>
                                        <SelectItem value="south">Phía Bắc</SelectItem>
                                        <SelectItem value="central">Miền Trung</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {errorMessage.regionManaged && (
                            <p className="text-sm text-red-500 ">{errorMessage.regionManaged}</p>
                        )}
                    </>
                )}
                {/* Password (Chỉ render khi bấm nút) */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">
                        Mật khẩu
                    </Label>
                    <div className="col-span-3 flex gap-2">
                        <Input
                            name="password"
                            value={formData.password}
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
                {errorMessage.password && <p className="text-sm text-red-500 ">{errorMessage.password}</p>}
            </div>

            <DialogFooter>
                <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Đang tạo...' : 'Tạo nhân viên'}
                </Button>
            </DialogFooter>
        </>
    );
};

export default DialogAddEmployee;
