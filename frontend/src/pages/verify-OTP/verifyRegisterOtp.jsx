import React, { useState } from 'react';

import ComponentOtp from '@/components/public/component.otp';

import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { sendOtpRegister, verifyOtpRegister } from '@/services/auth/authService';
import { useNavigate } from 'react-router-dom';
const VerifyRegisterOtp = () => {
    const emailForOtp = localStorage.getItem('emailForOtp');
    const [sendEmail, setSendEmail] = useState(false);
    const [sendEmailLoading, setSendEmailLoading] = useState(false);
    const [otp, setOtp] = useState('');
    const navigation = useNavigate();
    const sendEmailOtp = async () => {
        console.log('hi gọi hàm r');
        try {
            setSendEmailLoading(true);
            const response = await sendOtpRegister(emailForOtp);
            toast.success('OTP đã được gửi đến email ' + emailForOtp);
            setSendEmail(true);
        } catch (error) {
            toast.error('Lỗi gửi OTP: ' + error.message);
        } finally {
            setSendEmailLoading(false);
        }
    };
    // Verify OTP
    const verifyOtp = async () => {
        console.log('Gửi OTP:', otp);
        try {
            const response = await verifyOtpRegister(emailForOtp, otp);
            console.log('OTP sent successfully:', response.data);
            toast.success('OTP đã được xác minh thành công !, vui lòng đăng nhập lại !');
            setTimeout(() => {
                localStorage.removeItem('emailForOtp');
                navigation('/login');
            }, 2000);
        } catch (error) {
            console.error('Error sending OTP:', error);
            toast.error('Xác minh OTP thất bại!');
        }
    };

    return (
        <div className="">
            {sendEmail ? (
                <ComponentOtp
                    title="Xác minh OTP"
                    email={emailForOtp}
                    otp={otp}
                    setOtp={setOtp}
                    message="OTP đã được xác minh thành công, vui lòng đăng nhập lại !"
                    handleClose={verifyOtp}
                />
            ) : (
                <div className="bg-white flex flex-col items-center gap-2 border w-full max-w-100 mx-4 justify-center  p-5 rounded-md shadow-md ">
                    <div className="text-center mb-6">
                        <p className="text-gray-600 text-sm">Xác nhận gửi email đến</p>
                        <p className="font-bold text-xl text-blue-600 mt-2">{emailForOtp}</p>
                    </div>
                    <Button
                        onClick={sendEmailOtp}
                        className="mt-4 bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300"
                        disabled={sendEmailLoading}
                    >
                        {sendEmailLoading ? 'Đang gửi...' : 'Xác nhận'}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default VerifyRegisterOtp;
