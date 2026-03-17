import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { getReviewsByProduct } from '../../services/order/review.api';

const STARS = [5, 4, 3, 2, 1];

export default function ProductReviewList({ productId }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStar, setFilterStar] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [showAll, setShowAll] = useState(false);
    const [total, setTotal] = useState(0);
    const [averageRating, setAverageRating] = useState(0);

const fetchReviews = async () => {
    try {
        const res = await getReviewsByProduct(productId);
        console.log('API result:', res);
        setReviews(res.reviews || []);
        setTotal(res.total || 0);
        setAverageRating(res.averageRating || 0);

        console.log('reviews:', res.reviews);
    } catch (error) {
        console.error('Lỗi lấy đánh giá:', error);
    } finally {
        setLoading(false);
    }
};

    useEffect(() => {
        if (productId) {
            fetchReviews();
        }
    }, [productId]);

    if (loading) {
        return <p className="text-gray-500">Đang tải đánh giá...</p>;
    }
    

   

    const starCounts = {
        5: reviews.filter((r) => r.rating === 5).length,
        4: reviews.filter((r) => r.rating === 4).length,
        3: reviews.filter((r) => r.rating === 3).length,
        2: reviews.filter((r) => r.rating === 2).length,
        1: reviews.filter((r) => r.rating === 1).length,
    };

    const filteredReviews = filterStar ? reviews.filter((r) => r.rating === filterStar) : reviews;

    const visibleReviews = showAll ? filteredReviews : filteredReviews.slice(0, 5);

    return (
        <div className="space-y-8">
            {/* SUMMARY */}
            <div className="bg-gray-100 rounded-xl p-6">
                <div className="flex flex-col lg:flex-row gap-10 items-center">
                    {/* average */}
                    <div className="text-center">
                        <div className="text-5xl font-bold">{averageRating}/5</div>

                        <p className="text-gray-600 mt-1 text-sm"> ({total} đánh giá)</p>
                    </div>

                    {/* rating bars */}
                    <div className="flex-1 space-y-2">
                        {STARS.map((star) => {
                            const count = starCounts[star];

                            const percent = total ? (count / total) * 100 : 0;

                            return (
                                <div key={star} className="flex items-center gap-3">
                                    <span className="w-10 text-sm">{star} sao</span>

                                    <div className="flex-1 bg-gray-200 h-3 rounded-full">
                                        <div
                                            className="bg-yellow-400 h-3 rounded-full"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>

                                    <span className="w-8 text-sm text-right">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* FILTER */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setFilterStar(null)}
                    className={`px-4 py-2 rounded-full text-sm ${
                        filterStar === null ? 'bg-green-600 text-white' : 'bg-gray-200'
                    }`}
                >
                    Tất cả
                </button>

                {STARS.map((star) => (
                    <button
                        key={star}
                        onClick={() => setFilterStar(star)}
                        className={`px-4 py-2 rounded-full flex items-center gap-1 text-sm ${
                            filterStar === star ? 'bg-green-600 text-white' : 'bg-gray-200'
                        }`}
                    >
                        {star}
                        <Star className="w-4 h-4" />
                    </button>
                ))}
            </div>

            {/* REVIEW LIST */}
            <div className="space-y-6">
                {visibleReviews.length === 0 && <p className="text-gray-500">Chưa có đánh giá</p>}

                {visibleReviews.map((review) => (
                    <div key={review._id} className="border rounded-xl p-4 hover:bg-gray-50 transition">
                        {/* header */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                                {review.userId?.userName?.charAt(0) || 'U'}
                            </div>

                            <div>
                                <p className="text-sm font-semibold">{review.userId?.userName || 'User'}</p>

                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Star
                                            key={i}
                                            className={
                                                i <= review.rating
                                                    ? 'w-4 h-4 fill-yellow-400 text-yellow-400'
                                                    : 'w-4 h-4 text-gray-300'
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* comment */}
                        <p className="mt-3 text-gray-700 text-sm">{review.comment}</p>

                        {/* MEDIA */}
                        {(review.images?.length > 0 || review.videos?.length > 0) && (
                            <div className="flex gap-3 mt-3 flex-wrap">
                                {review.images?.map((img, i) => (
                                    <img
                                        key={'img' + i}
                                        src={img}
                                        className="w-24 h-24 object-cover rounded cursor-pointer"
                                        onClick={() => setPreviewImage(img)}
                                    />
                                ))}

                                {review.videos?.map((vid, i) => (
                                    <video
                                        key={'vid' + i}
                                        src={vid}
                                        controls
                                        className="w-24 h-24 object-cover rounded"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* SEE MORE */}
            {filteredReviews.length > 5 && (
                <div className="text-center">
                    <button onClick={() => setShowAll(!showAll)} className="text-green-600 font-medium hover:underline">
                        {showAll ? 'Thu gọn' : 'Xem thêm đánh giá'}
                    </button>
                </div>
            )}

            {/* IMAGE PREVIEW */}
            {previewImage && (
                <div
                    onClick={() => setPreviewImage(null)}
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
                >
                    <img src={previewImage} className="max-h-[90%] max-w-[90%]" />
                </div>
            )}
        </div>
    );
}
