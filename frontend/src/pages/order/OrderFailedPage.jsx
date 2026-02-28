import { XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import pay1 from '@/assets/pay.png';

const OrderFailedPage = () => {
    const navigate = useNavigate();

    return (
        <div
            className="relative min-h-screen flex items-center justify-center px-4 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${pay1})` }}
        >
            {/* Overlay làm nền tối hơn để glass nổi bật */}
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Glass Card */}
            <div
                className="relative 
                bg-white/10 
                backdrop-blur-xl 
                border border-white/20 
                shadow-2xl 
                rounded-2xl 
                p-8 
                w-full 
                max-w-md 
                text-center
                transition-all duration-300 hover:scale-[1.02]
            "
            >
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="bg-red-500/20 p-4 rounded-full backdrop-blur-md border border-red-300/30">
                        <XCircle className="w-16 h-16 text-red-400" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-red-400 mb-3">Thanh toán thất bại</h2>

                {/* Description */}
                <p className="text-white mb-6">
                    Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại hoặc chọn phương thức khác.
                </p>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <Button
                        className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
                        onClick={() => navigate('/checkout')}
                    >
                        Thử lại
                    </Button>

                    <Button
                        variant="outline"
                        className="rounded-xl text-black border-white/40 hover:bg-white/10"
                        onClick={() => navigate('/cart')}
                    >
                        Quay lại giỏ hàng
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default OrderFailedPage;
