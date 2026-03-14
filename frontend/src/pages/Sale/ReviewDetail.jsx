import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star } from 'lucide-react';
import { getReviewById } from '../../services/order/review.api';

const ReviewDetail = () => {
    const { id } = useParams();
    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchReview = async () => {
        try {
            setLoading(true);
            const res = await getReviewById(id);
            setReview(res.review || res);
        } catch (error) {
            console.error('Lỗi lấy chi tiết review:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReview();
    }, [id]);

    if (loading) {
        return <div className="p-6">Đang tải dữ liệu...</div>;
    }

    if (!review) {
        return <div className="p-6">Không tìm thấy review</div>;
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Chi tiết đánh giá</h1>

            {/* Product */}
            <div className="bg-white shadow rounded-xl p-6 flex gap-6 items-center">
                <img
                    src={review.productId?.images?.[0]}
                    alt={review.productId?.name}
                    className="w-24 h-24 object-cover rounded-lg border"
                />

                <div>
                    <p className="font-semibold text-lg">{review.productId?.name}</p>
                    <p className="text-gray-500">Giá: {review.productId?.price?.toLocaleString()} đ</p>
                </div>
            </div>

            {/* User */}
            <div className="bg-white shadow rounded-xl p-6">
                <h2 className="font-semibold mb-2">Người đánh giá</h2>
                <p>Email: {review.userId?.email}</p>
            </div>

            {/* Order */}
            <div className="bg-white shadow rounded-xl p-6">
                <h2 className="font-semibold mb-2">Đơn hàng</h2>
                <p>ID: {review.orderId?._id}</p>
                <p>Ngày đặt: {new Date(review.orderId?.createdAt).toLocaleDateString()}</p>
            </div>

            {/* Rating */}
            <div className="bg-white shadow rounded-xl p-6">
                <h2 className="font-semibold mb-2">Đánh giá</h2>

                <div className="flex items-center gap-1 text-yellow-500 mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} size={18} fill="currentColor" />
                    ))}
                </div>

                <p className="text-gray-700">{review.comment || 'Không có bình luận'}</p>
            </div>

            {/* Images */}
            {review.images?.length > 0 && (
                <div className="bg-white shadow rounded-xl p-6">
                    <h2 className="font-semibold mb-4">Ảnh đánh giá</h2>

                    <div className="flex gap-4 flex-wrap">
                        {review.images.map((img, index) => (
                            <img
                                key={index}
                                src={img}
                                alt="review"
                                className="w-32 h-32 object-cover rounded-lg border"
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Video */}
            {review.videos?.filter(Boolean).length > 0 && (
                <div className="bg-white shadow rounded-xl p-6">
                    <h2 className="font-semibold mb-4">Video đánh giá</h2>

                    {review.videos.filter(Boolean).map((video, index) => (
                        <video key={index} src={video} controls className="w-64 rounded-lg" />
                    ))}
                </div>
            )}

            {/* Status */}
            <div className="bg-white shadow rounded-xl p-6">
                <h2 className="font-semibold mb-2">Trạng thái</h2>

                <span
                    className={`px-3 py-1 rounded-full text-sm ${
                        review.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                >
                    {review.isActive ? 'Hiển thị' : 'Đã ẩn'}
                </span>
            </div>

            {/* Created */}
            <div className="text-gray-500 text-sm">Ngày tạo: {new Date(review.createdAt).toLocaleString()}</div>
        </div>
    );
};

export default ReviewDetail;
