import { CheckCircle2 } from 'lucide-react';
import { useNavigate,useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import pay1 from '@/assets/pay.png';

const OrderSuccessPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {orderId} = location.state || {}; 
    return (
        <div
            className="relative min-h-screen flex items-center justify-center px-4 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${pay1})` }}
        >
            {/* Overlay làm nền tối nhẹ cho chữ nổi */}
            <div className="absolute inset-0 bg-black/30"></div>

            <div className="relative bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-8 w-full max-w-md text-center">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="bg-green-100 p-4 rounded-full">
                        <CheckCircle2 className="w-16 h-16 text-green-600" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-green-500 mb-3">Thanh toán thành công!</h2>

                {/* Description */}
                <p className="text-white mb-6">
                    Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xác nhận và đang được xử lý.
                </p>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <Button
                        className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
                        onClick={() => navigate('/')}
                    >
                        Về trang chủ
                    </Button>

                    {orderId && (
                        <Button
                            variant="outline"
                            className="rounded-xl text-black border-white hover:bg-white/20"
                            onClick={() => navigate(`/orders/${orderId}`)}
                        >
                            Xem đơn hàng
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderSuccessPage;
