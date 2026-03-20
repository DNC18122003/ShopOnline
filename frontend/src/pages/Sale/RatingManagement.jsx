import { useEffect, useState } from 'react';
import { Eye, Trash2, Star ,RefreshCcw} from 'lucide-react';
import { getAllReviews, toggleReviewStatus } from '../../services/order/review.api';
import { useNavigate } from 'react-router-dom';

const RatingManagement = () => {
    const [reviews, setReviews] = useState([]);
    const [search, setSearch] = useState('');
    const [ratingFilter, setRatingFilter] = useState('');

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [loading, setLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [limit] = useState(5);
    const [totalPages, setTotalPages] = useState(1);

    const navigate = useNavigate();

    const fetchReviews = async () => {
        try {
            setLoading(true);

            // validate ngày
            if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
                alert('Ngày bắt đầu không được lớn hơn ngày kết thúc');
                return;
            }

            const res = await getAllReviews({
                search,
                rating: ratingFilter,
                startDate,
                endDate,
                page,
                limit,
            });

            console.log('API RES:', res);

            setReviews(res.reviews || []);
            setTotalPages(res.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Lỗi load review:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResetFilter = () => {
        setSearch('');
        setRatingFilter('');
        setStartDate('');
        setEndDate('');
        setPage(1);
    };

    useEffect(() => {
        fetchReviews();
    }, [search, ratingFilter, startDate, endDate, page]);

    // reset page khi filter
    useEffect(() => {
        setPage(1);
    }, [search, ratingFilter, startDate, endDate]);

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
            <div className="flex gap-4 mb-6 flex-wrap">
                <input
                    type="text"
                    placeholder="Search product..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    className="border px-3 py-2 rounded-md"
                />

                <select
                    value={ratingFilter}
                    onChange={(e) => {
                        setRatingFilter(e.target.value);
                        setPage(1);
                    }}
                    className="border px-3 py-2 rounded-md"
                >
                    <option value="">Tất cả sao</option>
                    <option value="5">5 sao</option>
                    <option value="4">4 sao</option>
                    <option value="3">3 sao</option>
                    <option value="2">2 sao</option>
                    <option value="1">1 sao</option>
                </select>

                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border rounded-lg px-4 py-2"
                />

                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border rounded-lg px-4 py-2"
                />
                <button
                    onClick={handleResetFilter}
                    className="flex items-center gap-2 bg-blue-400 hover:bg-blue-500 px-3 py-2 rounded-md"
                >
                    <RefreshCcw size={16} />
                    Refresh
                </button>
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

            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 mt-6">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-4 py-2 border rounded disabled:opacity-40"
                >
                    Prev
                </button>

                {[...Array(totalPages)].map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`px-3 py-1 border rounded ${page === i + 1 ? 'bg-blue-500 text-white' : ''}`}
                    >
                        {i + 1}
                    </button>
                ))}

                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-4 py-2 border rounded disabled:opacity-40"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default RatingManagement;
