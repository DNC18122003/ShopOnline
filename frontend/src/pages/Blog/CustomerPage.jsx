import React, { useState, useEffect } from 'react';
import blogService from '@/services/blog/blog.api';
import { useNavigate } from 'react-router-dom';
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = days[date.getDay()];
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${dayName} ${day}/${month}/${year}`;
};

// --- Các Icon SVG ---
const ClockIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 mr-1 text-gray-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
    </svg>
);

const LightningIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-black"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const EyeIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-3 w-3 mr-1 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
    </svg>
);

export default function BlogLayout() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // --- STATE CHO PHÂN TRANG ---
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 5;

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                setLoading(true);
                const response = await blogService.getAllBlogs();
                // Sắp xếp bài mới nhất lên đầu cho danh sách chính (tùy chọn)
                const sortedByDate = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setBlogs(sortedByDate);
            } catch (error) {
                console.error('Lỗi khi fetch danh sách blog:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    if (loading) {
        return <div className="text-center py-10 font-medium text-gray-600">Đang tải dữ liệu bài viết...</div>;
    }

    // --- LOGIC PHÂN TRANG (Cột Trái) ---
    const totalPages = Math.ceil(blogs.length / recordsPerPage);
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const mainArticles = blogs.slice(indexOfFirstRecord, indexOfLastRecord);

    // --- LOGIC TOP VIEW (Cột Phải) ---
    // Copy mảng blogs ra, sắp xếp theo viewCount giảm dần, lấy 5 bài đầu tiên
    const topViewedBlogs = [...blogs].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 5);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="max-w-6xl mx-auto p-4 flex flex-col md:flex-row gap-8 font-sans">
            {/* CỘT TRÁI: Danh sách bài viết chính */}
            <div className="w-full md:w-2/3">
                <div className="flex flex-col">
                    {mainArticles.map((article, index) => (
                        <React.Fragment key={article._id}>
                            <div
                                onClick={() => navigate(`/blogs/${article._id}`)} // Chuyển hướng khi click
                                className="flex flex-col sm:flex-row gap-4 py-4 group cursor-pointer"
                            >
                                <div className="w-full sm:w-64 flex-shrink-0">
                                    <img
                                        src={article.thumbnail}
                                        alt={article.title}
                                        className="w-full h-auto object-cover rounded border border-gray-200 shadow-sm"
                                    />
                                </div>

                                <div className="flex flex-col justify-start">
                                    <h3 className="text-[17px] font-semibold text-gray-800 group-hover:text-blue-600 transition-colors leading-snug">
                                        {article.title}
                                    </h3>
                                    <div className="flex items-center text-sm text-gray-500 mt-2">
                                        <ClockIcon />
                                        <span>{formatDate(article.createdAt)}</span>
                                        <span className="mx-2 font-bold">•</span>
                                        <span className="text-blue-500 hover:underline">{article.author}</span>
                                    </div>
                                </div>
                            </div>

                            {index !== mainArticles.length - 1 && <hr className="border-gray-300" />}
                        </React.Fragment>
                    ))}

                    {mainArticles.length === 0 && <p className="text-gray-500 py-4">Chưa có bài viết nào.</p>}
                </div>

                {/* --- UI ĐIỀU HƯỚNG PHÂN TRANG --- */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8 mb-4">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-3 py-1.5 rounded border ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-blue-600'}`}
                        >
                            Trang trước
                        </button>

                        {[...Array(totalPages)].map((_, idx) => {
                            const pageNumber = idx + 1;
                            return (
                                <button
                                    key={pageNumber}
                                    onClick={() => handlePageChange(pageNumber)}
                                    className={`w-8 h-8 flex items-center justify-center rounded border ${
                                        currentPage === pageNumber
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                                    }`}
                                >
                                    {pageNumber}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1.5 rounded border ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-blue-600'}`}
                        >
                            Trang sau
                        </button>
                    </div>
                )}
            </div>

            {/* CỘT PHẢI: Sidebar - Top Views */}
            <div className="w-full md:w-1/3 flex flex-col gap-10 mt-4 md:mt-0">
                <div>
                    <div className="relative bg-[#1a2f4c] text-white font-bold py-2 px-4 rounded-tl-md rounded-tr-3xl inline-block mb-5">
                        <span className="text-lg pr-4 uppercase">Xem nhiều nhất</span>
                        <div className="absolute right-[-15px] top-1/2 -translate-y-1/2 bg-yellow-400 p-1.5 rounded-full border-2 border-white">
                            <LightningIcon />
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        {topViewedBlogs.map((item, index) => (
                            <React.Fragment key={`top-${item._id}`}>
                                <div
                                    onClick={() => navigate(`/blogs/${item._id}`)} // Chuyển hướng khi click
                                    className="flex gap-3 group cursor-pointer"
                                >
                                    <div className="w-20 h-14 flex-shrink-0 relative">
                                        <img
                                            src={item.thumbnail}
                                            alt="thumb"
                                            className="w-full h-full object-cover rounded"
                                        />
                                        {/* Thêm số thứ tự (Top 1, 2, 3...) ở góc ảnh */}
                                        <div className="absolute -left-2 -top-2 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border border-white">
                                            {index + 1}
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-between">
                                        <h4 className="text-sm font-medium text-gray-700 group-hover:text-blue-600 line-clamp-2 leading-tight">
                                            {item.title}
                                        </h4>
                                        <div className="flex items-center text-xs text-gray-500 mt-1">
                                            <EyeIcon />
                                            {item.viewCount || 0} lượt xem
                                        </div>
                                    </div>
                                </div>
                                {index !== topViewedBlogs.length - 1 && <hr className="border-gray-200" />}
                            </React.Fragment>
                        ))}

                        {topViewedBlogs.length === 0 && <p className="text-sm text-gray-500">Đang cập nhật...</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
