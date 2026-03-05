import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { confirmMomoPayment } from '@/services/order/order.api';

const PaymentResultPage = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    useEffect(() => {
        const resultCode = params.get('resultCode');
        const orderId = params.get('orderId');

        if (resultCode === '0' && orderId) {
            confirmMomoPayment(orderId)
                .then(() => {
                    navigate('/order-success');
                })
                .catch(() => {
                    navigate('/order-failed');
                });
        } else {
            navigate('/order-failed');
        }
    }, []);

    return <div>Đang xử lý kết quả thanh toán...</div>;
};

export default PaymentResultPage;
