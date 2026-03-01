import React, { useState } from 'react';

import ComponentOtp from '@/components/public/component.otp';

import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { sendOtpRegister } from '@/services/auth/authService';
const VerifyRegisterOtp = () => {
    const emailForOtp = localStorage.getItem('emailForOtp');
    const [sendEmail, setSendEmail] = useState(false);
    const [sendEmailLoading, setSendEmailLoading] = useState(false);
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
    return (
        <div className="flex items-center justify-center h-screen">
            <div>
                {sendEmail ? (
                    <ComponentOtp title="Xác minh OTP" email={emailForOtp} />
                ) : (
                    <div className="flex items-center justify-center h-screen">
                        <div className="border w-full max-w-100 mx-4 flex items-center justify-center flex-col p-5 rounded-md shadow-md gap-3">
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
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyRegisterOtp;
