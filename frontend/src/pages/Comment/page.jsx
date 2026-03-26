import React, { useState, Suspense, useEffect } from 'react';
import { Search, Eye, X, ChevronLeft, ChevronRight, EyeOff, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';
import commentService from '@/services/comment/comment.api';
import { useAuth } from '../../context/authContext';

export default function CommentManagementPage() {
    // --- STATE LỌC ---
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'published', 'draft'
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // --- STATE DATA ---
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // --- STATE PHÂN TRANG ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // --- STATE XEM CHI TIẾT ---
    const [selectedComment, setSelectedComment] = useState(null);
    const [productComments, setProductComments] = useState([]);
    const [isLoadingProductComments, setIsLoadingProductComments] = useState(false);

    // --- STATE PHẢN HỒI ---
    const [replyingTo, setReplyingTo] = useState(null); // Lưu ID của comment đang được phản hồi
    const [replyContent, setReplyContent] = useState('');
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Component hiển thị lỗi
    const ErrorAlert = ({ message }) => {
        if (!message) return null;
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4 text-sm flex items-center animate-in fade-in slide-in-from-top-2">
                <span className="font-bold mr-2">Lỗi:</span>
                <span>{message}</span>
            </div>
        );
    };

    // GỌI API LẤY DANH SÁCH TẤT CẢ BÌNH LUẬN
    useEffect(() => {
        const fetchComments = async () => {
            setIsLoading(true);
            try {
                // Gọi qua service
                const response = await commentService.getAllComment();

                if (response && response.success) {
                    // Lọc lấy các bình luận gốc (không có parentId)
                    const rootComments = response.data.filter((item) => item.parentId === null);
                    setComments(rootComments);
                } else {
                    toast.error(response?.message || 'Lỗi khi lấy dữ liệu');
                }
            } catch (error) {
                console.error('Fetch error:', error);
                toast.error(error?.message || 'Không thể kết nối đến server');
            } finally {
                setIsLoading(false);
            }
        };

        fetchComments();
    }, []);
    // 2. Gọi API hiện comment theo product
    useEffect(() => {
        const fetchProductComments = async () => {
            // Kiểm tra xem có lấy được productId không

            if (selectedComment && selectedComment.productId?._id) {
                setIsLoadingProductComments(true);

                try {
                    const response = await commentService.getCommentsByProductId(selectedComment.productId._id);
                    const data = response.data || response;

                    setProductComments(data);
                } catch (error) {
                    console.error('Lỗi lấy danh sách bình luận sản phẩm:', error);
                } finally {
                    setIsLoadingProductComments(false);
                }
            } else {
                setProductComments([]);
            }
        };

        fetchProductComments();
    }, [selectedComment]);

    // 2. Gọi API xử lý ẩn hiện comment
    const handleToggleStatus = async (commentId, currentStatus) => {
        try {
            const newStatus = !currentStatus;

            // Gọi hàm ẩn hiện comment
            const response = await commentService.toggleCommentStatus(commentId, newStatus);
            if (response && response.success) {
                // Cập nhật lại state trực tiếp không cần load lại trang
                setComments((prevComments) =>
                    prevComments.map((comment) =>
                        comment._id === commentId ? { ...comment, isActive: newStatus } : comment,
                    ),
                );
                toast.success(newStatus ? 'Đã hiển thị bình luận' : 'Đã ẩn bình luận');
            } else {
                toast.error(response?.message || 'Lỗi khi cập nhật trạng thái');
            }
        } catch (error) {
            console.error('Update error:', error);
            toast.error(error?.message || 'Không thể kết nối đến server khi cập nhật');
        }
    };
    const { user } = useAuth();
    console.log('User in CommentManagementPage:', user);
    // Gọi API trả lời comment của sale
    const handleSendReply = async (parentComment) => {
        setErrorMessage('');

        if (!replyContent.trim()) {
            return setErrorMessage('Trường nhập comment không được để trống');
        }
        if (replyContent.length < 10) {
            return setErrorMessage('Trường nhập comment phải dài hơn 10 ký tự');
        }
        setIsSubmittingReply(true);
        try {
            const replyData = {
                productId: parentComment.productId?._id || parentComment.productId,
                userId: user?._id || user?._doc?._id,
                userModel: user.role !== 'customer' ? 'Employee' : 'User',
                content: replyContent,
                parentId: parentComment._id,
            };

            // Gọi hàm tạo comment
            const response = await commentService.createComment(replyData);
            console.log('Create comment response:', response);

            if (response && response.success) {
                toast.success('Phản hồi thành công!');
                // Đặt lại state UI
                setReplyContent('');
                setReplyingTo(null);
                // Lấy comment vừa tạo từ API trả về
                const newReply = response.data;

                // Cập nhật danh sách hiển thị
                setProductComments((prevComments) =>
                    prevComments.map((comment) => {
                        if (comment._id === parentComment._id) {
                            return {
                                ...comment,
                                // Thêm phản hồi mới vào mảng replies của comment cha
                                replies: [
                                    ...(comment.replies || []),
                                    {
                                        ...newReply,
                                        userId: {
                                            ...(user?._doc || user),
                                            _id: user?._id || user?._doc?._id,
                                        },
                                    },
                                ],
                            };
                        }
                        return comment;
                    }),
                );
            } else {
                toast.error(response?.message || 'Lỗi khi gửi phản hồi');
            }
        } catch (error) {
            console.error('Reply error:', error);
            toast.error(error?.message || 'Không thể kết nối server');
        } finally {
            setIsSubmittingReply(false);
        }
    };
    // --- LOGIC TÌM KIẾM ---
    // Tự động đưa về trang 1 khi người dùng gõ tìm kiếm
    // Tự động đưa về trang 1 khi bất kỳ bộ lọc nào thay đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, startDate, endDate]);

    const filteredComments = comments.filter((comment) => {
        // 1. Lọc theo Từ khóa (Search)
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
            comment.content?.toLowerCase().includes(searchLower) ||
            comment.productId?.name?.toLowerCase().includes(searchLower) ||
            comment.userId?.userName?.toLowerCase().includes(searchLower);

        // 2. Lọc theo Trạng thái (Status)
        // isActive === false tương ứng 'draft' (Ẩn), ngược lại là 'published' (Hiển thị)
        const isCommentActive = comment.isActive !== false;
        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'published' && isCommentActive) ||
            (statusFilter === 'draft' && !isCommentActive);

        // 3. Lọc theo Thời gian (Date)
        const commentDate = new Date(comment.createdAt).setHours(0, 0, 0, 0);
        const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
        const end = endDate ? new Date(endDate).setHours(0, 0, 0, 0) : null;

        const matchesDate = (!start || commentDate >= start) && (!end || commentDate <= end);

        return matchesSearch && matchesStatus && matchesDate;
    });

    // --- LOGIC TÍNH TOÁN PHÂN TRANG (Dựa trên filteredComments thay vì comments gốc) ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredComments.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredComments.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <Suspense fallback={<div>Đang tải trang...</div>}>
            <div className="min-h-screen bg-gray-100 relative">
                <main className="p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Danh sách Comment</h1>
                    </div>

                    {/* Filter Bar */}
                    <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex gap-4">
                        <div className="relative flex-1 max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Tìm kiếm tên, nội dung..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="w-full md:w-auto min-w-[150px]">
                            <select
                                className="w-full h-10 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="published">Hiển Thị</option>
                                <option value="draft">Ẩn</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Input
                                type="date"
                                className="w-full md:w-[140px] text-sm"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <Input
                                type="date"
                                className="w-full md:w-[140px] text-sm"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                            {/* Nút reset nhanh nếu cần */}
                            {(startDate || endDate || statusFilter !== 'all') && (
                                <button
                                    onClick={() => {
                                        setStartDate('');
                                        setEndDate('');
                                        setStatusFilter('all');
                                    }}
                                    className="text-xs text-red-500 hover:underline px-2"
                                >
                                    Xóa lọc
                                </button>
                            )}
                        </div>
                    </div>

                    {/* DANH SÁCH COMMENT */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                        {isLoading ? (
                            <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
                        ) : filteredComments.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">Không tìm thấy bình luận nào.</div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {currentItems.map((comment) => (
                                    <div
                                        key={comment._id}
                                        className={`p-4 flex items-center justify-between transition-colors ${
                                            comment.isActive !== false ? 'hover:bg-gray-50' : 'bg-gray-50 opacity-60'
                                        }`}
                                    >
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded border overflow-hidden">
                                                <img
                                                    src={
                                                        comment.productId?.images?.[0] ||
                                                        'https://dummyimage.com/100x100/eee/000&text=No+Image'
                                                    }
                                                    alt={comment.productId?.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            <div className="flex flex-col justify-center">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-sm font-semibold text-blue-600">
                                                        {comment.productId?.name || 'Sản phẩm không xác định'}
                                                    </h3>

                                                    {comment.isActive !== false ? (
                                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">
                                                            Hiển thị
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-[10px] font-bold rounded-full uppercase">
                                                            Đã ẩn
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="text-xs text-gray-500">
                                                    Bởi:{' '}
                                                    <span className="font-medium text-gray-800">
                                                        {comment.userId?.userName}
                                                    </span>
                                                </div>

                                                <p className="text-gray-600 text-sm mt-1 line-clamp-1">
                                                    {comment.content}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="ml-4 flex items-center gap-2">
                                            {/* Nút Xem Chi Tiết */}
                                            <button
                                                onClick={() => setSelectedComment(comment)}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-sm font-medium"
                                                title="Xem chi tiết"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>

                                            {/* NÚT ẨN/HIỆN */}
                                            <button
                                                onClick={() =>
                                                    handleToggleStatus(comment._id, comment.isActive !== false)
                                                }
                                                className={`flex items-center gap-1 px-3 py-1.5 rounded transition-colors text-sm font-medium ${
                                                    comment.isActive !== false
                                                        ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' // Đang hiện -> Nút ẩn (Cam)
                                                        : 'bg-green-50 text-green-600 hover:bg-green-100' // Đang ẩn -> Nút hiện (Xanh)
                                                }`}
                                                title={comment.isActive !== false ? 'Ẩn bình luận này' : 'Hiển thị lại'}
                                            >
                                                {comment.isActive !== false ? (
                                                    <EyeOff className="w-4 h-4" />
                                                ) : (
                                                    <CheckCircle className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* UI PHÂN TRANG */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded border bg-white disabled:opacity-50 hover:bg-gray-50"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => paginate(i + 1)}
                                    className={`w-8 h-8 flex items-center justify-center rounded border ${
                                        currentPage === i + 1
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white hover:bg-gray-50'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded border bg-white disabled:opacity-50 hover:bg-gray-50"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </main>
            </div>

            {/* MODAL XEM CHI TIẾT */}
            {selectedComment && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col relative">
                        {/* Header Modal */}
                        <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
                            <h2 className="text-xl font-bold uppercase text-gray-800">Chi tiết sản phẩm & Bình luận</h2>
                            <button
                                onClick={() => setSelectedComment(null)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body Modal */}
                        <div className="p-6 space-y-10">
                            {/* --- PHẦN 1: THÔNG TIN SẢN PHẨM & THÔNG SỐ --- */}
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="w-full md:w-1/3 flex flex-col items-center">
                                    <img
                                        src={
                                            selectedComment.productId?.images?.[0] ||
                                            'https://dummyimage.com/400x400/eee/000&text=No+Image'
                                        }
                                        alt={selectedComment.productId?.name}
                                        className="w-full max-w-[280px] object-contain rounded-lg mix-blend-multiply"
                                    />
                                </div>

                                <div className="w-full md:w-2/3">
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                        {selectedComment.productId?.name}
                                    </h1>
                                    <div className="text-2xl font-bold text-red-600 mb-6">
                                        {selectedComment.productId?.price?.toLocaleString('vi-VN')} ₫
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-gray-500 mr-2">Tồn kho:</span>
                                        <span
                                            className={`font-bold px-2.5 py-1 rounded-md ${
                                                selectedComment.productId?.stock > 0
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}
                                        >
                                            {selectedComment.productId?.stock > 0
                                                ? `${selectedComment.productId?.stock} sản phẩm`
                                                : 'Hết hàng'}
                                        </span>
                                    </div>

                                    {/* Bảng thông số kỹ thuật */}
                                    {selectedComment.productId?.specifications?.detail_json ? (
                                        <div className="mt-6">
                                            <h3 className="text-base font-bold text-gray-800 mb-3 uppercase">
                                                Thông số kỹ thuật
                                            </h3>
                                            <div className="border rounded-lg overflow-hidden border-gray-200 text-sm">
                                                {Object.entries(
                                                    selectedComment.productId.specifications.detail_json,
                                                ).map(([key, value], index) => (
                                                    <div
                                                        key={key}
                                                        className={`flex px-4 py-2.5 ${
                                                            index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                                                        }`}
                                                    >
                                                        <div className="w-1/3 font-medium text-gray-600">{key}</div>
                                                        <div className="w-2/3 text-gray-900 font-medium">{value}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic text-sm mt-6">
                                            Sản phẩm này chưa có thông số kỹ thuật.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <hr className="border-gray-200" />

                            {/* --- PHẦN 2: KHU VỰC HỎI VÀ ĐÁP --- */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-4 uppercase">
                                    Hỏi và đáp (Bình luận)
                                </h3>
                                {/* Hiển thị lỗi */}
                                <ErrorAlert message={errorMessage} />
                                <div className="border rounded-xl p-6 shadow-sm bg-white max-h-[400px] overflow-y-auto">
                                    {isLoadingProductComments ? (
                                        <div className="text-center text-gray-500 py-4">Đang tải bình luận...</div>
                                    ) : productComments.length > 0 ? (
                                        <div className="space-y-6">
                                            {productComments.map((comment) => (
                                                <div
                                                    key={comment._id}
                                                    className="flex flex-col gap-3 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                                                >
                                                    {/* THÂN BÌNH LUẬN CHÍNH */}
                                                    <div className="flex gap-4">
                                                        <div className="w-10 h-10 flex-shrink-0 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm">
                                                            {comment.userId?.userName?.charAt(0).toUpperCase() || 'U'}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-1">
                                                                <span className="font-bold text-gray-900">
                                                                    {comment.userId?.userName || 'Người dùng ẩn danh'}
                                                                </span>
                                                                <span className="text-xs text-gray-400">
                                                                    {new Date(comment.createdAt).toLocaleDateString(
                                                                        'vi-VN',
                                                                        {
                                                                            day: '2-digit',
                                                                            month: '2-digit',
                                                                            year: 'numeric',
                                                                            hour: '2-digit',
                                                                            minute: '2-digit',
                                                                        },
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className="text-gray-700 text-sm mt-1 leading-relaxed">
                                                                {comment.content}
                                                            </div>
                                                            <div className="flex gap-4 text-xs text-blue-600 font-medium mt-2">
                                                                <button
                                                                    onClick={() => setReplyingTo(comment._id)}
                                                                    className="text-xs text-blue-600 font-medium hover:underline w-fit"
                                                                >
                                                                    Phản hồi
                                                                </button>

                                                                {replyingTo === comment._id && (
                                                                    <div className="w-full mt-2 space-y-2 animate-in fade-in slide-in-from-top-1">
                                                                        <textarea
                                                                            value={replyContent}
                                                                            onChange={(e) => {
                                                                                setReplyContent(e.target.value);
                                                                                // Nếu đang có lỗi thì xóa lỗi đi
                                                                                if (errorMessage) setErrorMessage('');
                                                                            }}
                                                                            placeholder="Viết câu trả lời..."
                                                                            className="w-full p-2 text-sm border rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                                                                            rows={2}
                                                                        />
                                                                        <div className="flex gap-2">
                                                                            <button
                                                                                onClick={() => handleSendReply(comment)}
                                                                                disabled={isSubmittingReply}
                                                                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:bg-blue-300"
                                                                            >
                                                                                {isSubmittingReply
                                                                                    ? 'Đang gửi...'
                                                                                    : 'Gửi'}
                                                                            </button>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setReplyingTo(null);
                                                                                    setReplyContent('');
                                                                                }}
                                                                                className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded hover:bg-gray-300"
                                                                            >
                                                                                Hủy
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* CÁC BÌNH LUẬN TRẢ LỜI */}
                                                    {comment.replies && comment.replies.length > 0 && (
                                                        <div className="ml-14 mt-2 flex flex-col gap-4 border-l-2 border-gray-200 pl-4">
                                                            {comment.replies.map((reply) => (
                                                                <div
                                                                    key={reply._id}
                                                                    className="flex gap-3 bg-gray-50 p-3 rounded-lg"
                                                                >
                                                                    <div
                                                                        className={`w-8 h-8 flex-shrink-0 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${
                                                                            reply.userId?.role !== 'customer'
                                                                                ? 'bg-orange-500'
                                                                                : 'bg-gray-400'
                                                                        }`}
                                                                    >
                                                                        {reply.userId?.userName
                                                                            ?.charAt(0)
                                                                            .toUpperCase() || 'U'}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <span className="font-bold text-gray-900 text-sm">
                                                                                {reply.userId?.userName ||
                                                                                    'Người dùng ẩn danh'}
                                                                            </span>
                                                                            {reply.userId?.role !== 'customer' && (
                                                                                <span className="bg-orange-100 text-orange-600 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold">
                                                                                    Sale
                                                                                </span>
                                                                            )}
                                                                            <span className="text-xs text-gray-400">
                                                                                {new Date(
                                                                                    reply.createdAt,
                                                                                ).toLocaleDateString('vi-VN', {
                                                                                    day: '2-digit',
                                                                                    month: '2-digit',
                                                                                    year: 'numeric',
                                                                                    hour: '2-digit',
                                                                                    minute: '2-digit',
                                                                                })}
                                                                            </span>
                                                                        </div>
                                                                        <div className="text-gray-700 text-sm leading-relaxed">
                                                                            {reply.content}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-500 py-4">
                                            Chưa có bình luận nào cho sản phẩm này.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer Modal */}
                        <div className="p-4 border-t flex justify-end bg-gray-50 rounded-b-lg">
                            <button
                                onClick={() => setSelectedComment(null)}
                                className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors font-medium shadow-sm"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Suspense>
    );
}
