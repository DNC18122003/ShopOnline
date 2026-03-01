import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';
import { changePasswordByOldPassword } from '@/services/auth/authService';
const ChangePasswordPage = () => {
    const [step, setStep] = React.useState(0);
    const [formPassword, setFormPassword] = React.useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = React.useState(false);
    const handleChange = (e) => {
        setFormPassword({
            ...formPassword,
            [e.target.name]: e.target.value,
        });
    };
    const validateForm = (form) => {
        const errors = {};
        const { currentPassword, newPassword, confirmPassword } = formPassword;
        if (!currentPassword || !newPassword || !confirmPassword) {
            errors.emptyFieldError = 'Vui lòng nhập đầy đủ thông tin';
        }
        if (newPassword !== confirmPassword) {
            errors.confirmPasswordError = 'Mật khẩu mới và xác nhận mật khẩu mới không khớp !';
        }
        return errors;
    };
    const handleSubmitForm = async () => {
        console.log('hi');
        const errors = validateForm(formPassword);
        if (Object.keys(errors).length > 0) {
            toast.error(errors.emptyFieldError || errors.confirmPasswordError);
            return;
        }
        console.log('hi submit');
        try {
            setLoading(true);
            const response = await changePasswordByOldPassword(formPassword.currentPassword, formPassword.newPassword);

            if (response) {
                toast.success(response.message);
                // setStep(1);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại !');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="w-full  flex items-center justify-center ">
            {/* 
        /*
        1. hiển thị form : 3 input : current password, new password, confirm new password
        2. validate :
        3. verify otp
        4. change password
        */}
            {step === 0 ? (
                <div className="border w-100  mx-4 flex items-center justify-center flex-col p-5 rounded-md shadow-md gap-3">
                    <h2 className="text-2xl font-semibold">Đổi mật khẩu</h2>
                    <Input
                        type="password"
                        placeholder="Mật khẩu hiện tại"
                        name="currentPassword"
                        onChange={handleChange}
                    />
                    <Input type="password" placeholder="Mật khẩu mới" name="newPassword" onChange={handleChange} />
                    <Input
                        type="password"
                        placeholder="Xác nhận mật khẩu mới"
                        name="confirmPassword"
                        onChange={handleChange}
                    />
                    <Button
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={handleSubmitForm}
                        disabled={loading}
                    >
                        Tiếp tục
                    </Button>
                </div>
            ) : null}
        </div>
    );
};

export default ChangePasswordPage;
