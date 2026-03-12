import React from 'react';

import ComponentOtp from '@/components/public/component.otp';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';
import {
    changePasswordForgot,
    findEmailForgotPassword,
    verifyOtpForgotPassword,
    verifyOtpRegister,
} from '@/services/auth/authService';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ForgotPasswordPage = () => {
    const [step, setStep] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    const [email, setEmail] = React.useState('');
    const [otp, setOtp] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const navigate = useNavigate();
    // Send email verify
    const handleSendOtp = async () => {
        //console.log('hi');
        if (!email.trim()) {
            return toast.error('Vui lòng nhập email');
        }

        try {
            setLoading(true);
            const response = await findEmailForgotPassword(email.trim());
            console.log('Response from findEmailForgotPassword:', response);
            if (response) {
                toast.success('Email hợp lệ, vui lòng kiểm tra hộp thư để nhận OTP !');
                setStep(1);
            }
        } catch (error) {
            toast.error('Lỗi gửi OTP!');
        } finally {
            setLoading(false);
        }
    };
    // Verify OTP
    const verifyOtp = async () => {
        //console.log('Gửi OTP:', otp);
        try {
            const response = await verifyOtpForgotPassword(email.trim(), otp.trim());
            console.log('OTP sent successfully:', response.data);
            toast.success('OTP đã được xác minh thành công !');
            setStep(2);
        } catch (error) {
            console.error('Error sending OTP:', error.response.data.message);
            toast.error(error.response.data.message || 'Xác minh OTP thất bại!');
        }
    };
    // Change password
    const handleChangePassword = async () => {
        try {
            if (!password.trim() || !confirmPassword.trim()) {
                return toast.error('Vui lòng nhập đầy đủ thông tin');
            }
            if (password.trim() !== confirmPassword.trim()) {
                return toast.error('Mật khẩu xác nhận không khớp');
            }
            // Call service to change password
            const response = await changePasswordForgot(email.trim(), password.trim());
            console.log('Response from changePasswordForgot:', response);
            if (response) {
                toast.success('Đổi mật khẩu thành công, vui lòng đăng nhập lại!');
                setTimeout(() => {
                    navigate('/login');
                }, 1000);
            }
        } catch (error) {
            toast.error('Lỗi đổi mật khẩu!');
        }
    };

    return (
        <div className="">
            {step === 0 ? (
                <div className=" bg-white border w-100  mx-4 flex items-center justify-center flex-col p-5 rounded-md shadow-md gap-3 relative">
                    <ArrowLeft
                        className="absolute top-6 left-4 cursor-pointer text-[#3B82F6]"
                        onClick={() => navigate('/login')}
                    />
                    {/* Nội dung bao gồm : Nút button - Input nhập email xác minh */}
                    <h2 className="text-xl font-semibold ">Quên mật khẩu</h2>

                    {/* Input Email */}
                    <Input
                        type="email"
                        placeholder="Nhập email của bạn"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="focus-visible:ring-[#3B82F6] focus-visible:ring-2"
                    />

                    {/* Button */}
                    <Button
                        onClick={handleSendOtp}
                        disabled={loading}
                        className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-all duration-200"
                    >
                        {loading ? 'Đang gửi...' : 'Gửi OTP'}
                    </Button>
                </div>
            ) : step === 1 ? (
                <ComponentOtp
                    title="Xác minh OTP"
                    email={email}
                    otp={otp}
                    setOtp={setOtp}
                    message="OTP đã được xác minh thành công !"
                    handleClose={verifyOtp}
                />
            ) : (
                <div className="bg-white border w-100  mx-4 flex items-center justify-center flex-col p-5 rounded-md shadow-md gap-3">
                    {/* Nội dung bao gồm : Nút button - Input nhập email xác minh */}
                    <h2 className="text-xl font-semibold ">Đổi mật khẩu</h2>

                    {/* Input Email */}
                    <Input
                        type="password"
                        placeholder="Nhập mật khẩu mới"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="focus-visible:ring-[#3B82F6] focus-visible:ring-2"
                    />
                    {/* Confirm Password */}
                    <Input
                        type="password"
                        placeholder="Xác nhận mật khẩu mới"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="focus-visible:ring-[#3B82F6] focus-visible:ring-2"
                    />

                    {/* Button */}
                    <Button
                        onClick={handleChangePassword}
                        disabled={loading}
                        className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-all duration-200"
                    >
                        {loading ? 'Đang đổi...' : 'Đổi mật khẩu'}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ForgotPasswordPage;
