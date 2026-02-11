import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
const Page403 = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>
            <div className="max-w-2xl w-full text-center">
                {/* 1. Phần Mã lỗi (Header) */}
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-400">
                        403
                    </h1>
                    {/* Đường line trang trí đơn giản */}
                    <div className="h-1 w-24 mx-auto rounded-full bg-linear-to-r from-blue-400 to-purple-400 "></div>
                </div>

                {/* 2. Phần Thông điệp (Body) */}
                <div className="mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-balance leading-tight">
                        Bé yêu không có quyền hạn để vào được đây!
                    </h2>
                    <p className="text-lg text-slate-400 mb-12 text-balance">Đi ra chỗ khác chơi !</p>
                </div>
                {/* 3. Phần Hành động (Actions) */}
                <div className="flex gap-4 justify-center">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => navigate(-1)}
                        className="px-8 py-6 text-white font-semibold border-2 hover:bg-slate-100 transition-all bg-transparent"
                    >
                        Quay lại
                    </Button>

                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => navigate('/')}
                        className="px-8 py-6 text-white font-semibold border-2 hover:bg-slate-100 transition-all bg-transparent"
                    >
                        Về trang chủ
                    </Button>
                </div>
                {/* 4. Phần Footer trang trí */}
                <div className="mt-16 pt-8 border-t">
                    <p className="text-sm text-slate-400">Mã lỗi: 403 | Truy cập bị từ chối</p>
                </div>
            </div>
        </div>
    );
};

export default Page403;
