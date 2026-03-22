import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { confirmMomoPayment, cancelMomoPayment } from '@/services/order/order.api';

const PaymentResultPage = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const handlePayment = async () => {
            const resultCode = params.get('resultCode');
            const orderId = params.get('orderId');

            if (!orderId) {
                navigate('/order-failed');
                return;
            }

            try {
                if (resultCode === '0') {
                    // thanh toán thành công
                    await confirmMomoPayment(orderId);
                    navigate('/order-success');
                } else {
                    // thanh toán thất bại → release reservedStock
                    await cancelMomoPayment(orderId);
                    navigate('/order-failed');
                }
            } catch (error) {
                console.error(error);
                navigate('/order-failed');
            }
        };

        handlePayment();
    }, [params, navigate]);

    return <div>Đang xử lý kết quả thanh toán...</div>;
};

export default PaymentResultPage;
