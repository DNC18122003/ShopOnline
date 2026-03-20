import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, User, Eye, ArrowLeft } from 'lucide-react';
import blogService from '@/services/blog/blog.api';

// --- Hàm hỗ trợ format ngày tháng ---
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

const BlogDetails = () => {
    // 1. Lấy ID bài viết từ URL
    const { id } = useParams();

    // 2. Khai báo State lưu dữ liệu
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    // 3. Gọi API lấy chi tiết bài viết khi vào trang
    useEffect(() => {
        const fetchBlogDetail = async () => {
            try {
                setLoading(true);
                const response = await blogService.getBlogDetail(id);

                if (response.data) {
                    setBlog(response.data);
                }
            } catch (error) {
                console.error('Lỗi khi tải chi tiết bài viết:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchBlogDetail();
        }
    }, [id]);

    // 4. Giao diện khi đang tải dữ liệu
    if (loading) {
        return (
            <div className="max-w-4xl mx-auto py-20 text-center text-lg text-gray-600 font-medium">
                Đang tải nội dung bài viết...
            </div>
        );
    }

    // 5. Giao diện khi ID không hợp lệ hoặc API lỗi
    if (!blog) {
        return (
            <div className="max-w-4xl mx-auto py-20 text-center text-lg text-red-500 font-medium">
                Không tìm thấy bài viết này.
            </div>
        );
    }

    // 6. Giao diện chính của bài viết
    return (
        <div className="max-w-4xl mx-auto py-8 px-4 font-sans">
            {/* Nút quay lại danh sách */}
            <Link to="/blogList" className="inline-flex items-center text-blue-600 hover:underline mb-6 font-medium">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Quay lại danh sách
            </Link>

            <article className="bg-white rounded-lg">
                {/* Tiêu đề */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">{blog.title}</h1>

                {/* Thông tin bài viết (Ngày, Tác giả, Lượt xem) */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 border-b border-gray-200 pb-4">
                    <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1.5" />
                        {formatDate(blog.createdAt)}
                    </div>
                    <div className="flex items-center">
                        <User className="w-4 h-4 mr-1.5" />
                        {blog.author}
                    </div>
                    <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1.5" />
                        {blog.viewCount || 0} lượt xem
                    </div>
                </div>

                {/* Ảnh Thumbnail */}
                {blog.thumbnail && (
                    <div className="mb-8 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                        <img
                            src={blog.thumbnail}
                            alt={blog.title}
                            className="w-full h-auto max-h-[500px] object-cover"
                        />
                    </div>
                )}

                {/* Nội dung bài viết (Render HTML từ Backend) */}
                <div
                    className="prose max-w-none text-gray-800 text-[17px] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                />
            </article>
        </div>
    );
};

export default BlogDetails;
