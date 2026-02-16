import React, { useEffect, useRef, useState } from 'react';

import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp';
import { BadgeQuestionMark } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

const ComponentOtp = ({ title, email }) => {
    const [otp, setOtp] = useState('');

    const [time, setTime] = useState(60);
    const maskEmail = (email) => {
        console.log('email', email);
        const parts = email.split('@');
        const userName = parts[0];
        const domain = parts[1];
        // lấy max 3 kí tự đầu, + "***" ở cuối
        const maskedUserName = userName.slice(0, 3) + '***';
        return `${maskedUserName}@${domain}`;
    };
    useEffect(() => {
        const timer = setInterval(() => {
            setTime((prevTime) => {
                if (prevTime > 0) return prevTime - 1;
                clearInterval(timer); // Dừng timer khi hết thời gian
                return prevTime;
            });
        }, 1000);

        // Dọn dẹp khi component unmount
        return () => clearInterval(timer);
    }, []);

    const handleResendOtp = () => {
        console.log('Gửi lại OTP');
        // Logic gửi lại mã OTP
    };
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="border w-full max-w-100 mx-4 flex items-center justify-center flex-col p-5 rounded-md shadow-md gap-3">
                {/* UI chính thức */}
                <div className="flex items-center justify-center bg-blue-400 h-10 w-10 rounded-full ">
                    <BadgeQuestionMark />
                </div>
                <h4 class="font-semibold text-slate-900">{title}</h4>
                <p className="text-sm text-slate-500">Vui lòng nhập mã otp 6 chữ số được gửi tới email của bạn</p>
                <p className="text-slate-500">
                    Gửi đến: <span className="text-black">{maskEmail(email)}</span>
                </p>
                <InputOTP
                    maxLength={6}
                    value={otp} // Gán giá trị từ state
                    onChange={(value) => setOtp(value)}
                >
                    <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                    </InputOTPGroup>
                </InputOTP>
                <Button className="w-[90%] mx-auto bg-blue-600">Xác thực</Button>
                <span className="text-slate-500"> Không nhận được mã ?</span>

                <p
                    className={cn(
                        'select-none', // Chống bôi đen văn bản khi click nhiều lần
                        time > 0 ? 'cursor-not-allowed  text-gray-400' : 'cursor-pointer text-blue-600 hover:underline',
                    )}
                    onClick={() => {
                        if (time === 0) handleResendOtp();
                    }}
                >
                    Gửi lại mã OTP {time > 0 && <span>({time}s)</span>}
                </p>
            </div>
        </div>
    );
};

export default ComponentOtp;
