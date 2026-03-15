import { useEffect, useState } from 'react';
import { Eye, Trash2, Star } from 'lucide-react';
import { getAllReviews, toggleReviewStatus } from '../../services/order/review.api';
import { useNavigate } from 'react-router-dom';


const RatingManagement = () => {
    const [reviews, setReviews] = useState([]);
    const [search, setSearch] = useState('');
    const [ratingFilter, setRatingFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchReviews = async () => {
        try {
            setLoading(true);

            const res = await getAllReviews({
                search,
                rating: ratingFilter,
            });
           

            setReviews(res.reviews || []);
        } catch (error) {
            console.error('Lỗi load review:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [search, ratingFilter]);

    const handleToggleStatus = async (id) => {
        if (!window.confirm('Bạn có chắc muốn thay đổi trạng thái review?')) return;

        try {
            await toggleReviewStatus(id);
            fetchReviews();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Quản lý đánh giá sản phẩm</h1>

            {/* Filter */}
            <div className="flex gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Tìm theo sản phẩm hoặc user..."
                    className="border rounded-lg px-4 py-2 w-80"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select
                    className="border rounded-lg px-4 py-2"
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                >
                    <option value="">Tất cả sao</option>
                    <option value="5">5 sao</option>
                    <option value="4">4 sao</option>
                    <option value="3">3 sao</option>
                    <option value="2">2 sao</option>
                    <option value="1">1 sao</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white shadow rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 text-sm">
                        <tr>
                            <th className="p-4">Sản phẩm</th>
                            <th className="p-4">Người dùng</th>
                            <th className="p-4">Số sao</th>
                            <th className="p-4">Bình luận</th>
                            <th className="p-4">Ngày</th>
                            <th className="p-4 text-center">Hành động</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan="6" className="text-center p-6">
                                    Đang tải dữ liệu...
                                </td>
                            </tr>
                        )}

                        {!loading &&
                            reviews.map((item) => (
                                <tr key={item._id} className="border-t">
                                    <td className="p-4">{item.productId?.name || 'Không xác định'}</td>

                                    <td className="p-4">
                                        {item.userId?.fullName || item.userId?.userName || 'Không xác định'}
                                    </td>

                                    <td className="p-4">
                                        <div className="flex gap-1 text-yellow-500">
                                            {[...Array(item.rating)].map((_, i) => (
                                                <Star key={i} size={16} fill="currentColor" />
                                            ))}
                                        </div>
                                    </td>

                                    <td className="p-4 max-w-xs truncate">{item.comment || 'Không có bình luận'}</td>

                                    <td className="p-4">{new Date(item.createdAt).toLocaleDateString()}</td>

                                    <td className="p-4 flex justify-center gap-3">
                                        <button
                                            onClick={() => navigate(`/sale/review/${item._id}`)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <Eye size={18} />
                                        </button>

                                        <button
                                            onClick={() => handleToggleStatus(item._id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}

                        {!loading && reviews.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center p-6 text-gray-500">
                                    Không có đánh giá
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RatingManagement;
