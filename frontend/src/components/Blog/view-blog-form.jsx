import React, { useState, useEffect } from 'react';
import { Eye, Calendar, User, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import blogService from '@/services/blog/blog.api';
export function ViewBlogForm({ blogId, onCancel }) {
    const [blog, setBlog] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    // Tự động lấy dữ liệu bài viết dựa vào ID được Modal truyền xuống
    useEffect(() => {
        if (!blogId) return;
        const fetchBlogDetail = async () => {
            setIsLoading(true);
            try {
                const result = await blogService.getBlogDetail(blogId);

                if (result && result.success) {
                    setBlog(result.data);
                } else {
                    console.error('Lỗi từ server:', result?.message);
                }
            } catch (error) {
                console.error('Lỗi kết nối hoặc hệ thống:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBlogDetail();
    }, [blogId]);

    // Format ngày tháng hiển thị đẹp hơn
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    // Hiển thị loading khi đang lấy dữ liệu, hoặc thông báo lỗi nếu không tìm thấy bài viết
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
                <p className="text-gray-500">Đang tải dữ liệu...</p>
            </div>
        );
    }
    if (!blog) {
        return <div className="py-10 text-center text-gray-500">Không tìm thấy dữ liệu!</div>;
    }
    // Hiển thị chi tiết bài viết với các trường thông tin
    return (
        <div className="space-y-5">
            <div className="text-xl font-bold border-b pb-3">Chi tiết bài viết</div>

            {/* Ảnh bài viết */}
            <div className="flex flex-col gap-3">
                <Label className="font-bold">Ảnh bài viết</Label>
                <div className="w-full h-48 border rounded-lg bg-gray-50 overflow-hidden flex items-center justify-center">
                    {blog.thumbnail ? (
                        <img
                            src={blog.thumbnail}
                            alt={blog.title}
                            className="w-full h-full object-contain bg-black/5"
                        />
                    ) : (
                        <ImageIcon className="w-10 h-10 text-gray-300" />
                    )}
                </div>
            </div>

            {/* Tiêu đề */}
            <div className="space-y-2">
                <Label className="font-bold">Tiêu đề bài viết</Label>
                <Input
                    readOnly
                    value={blog.title || ''}
                    className="bg-gray-50 font-medium cursor-default focus-visible:ring-0"
                />
            </div>

            {/* Nội dung */}
            <div className="space-y-2">
                <Label className="font-bold">Nội dung bài viết</Label>
                <Textarea
                    readOnly
                    value={blog.content || ''}
                    className="min-h-[150px] bg-gray-50 leading-relaxed cursor-default focus-visible:ring-0"
                />
            </div>

            {/* Grid: Tác giả, Ngày đăng, Lượt xem, Trạng thái */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                <div className="space-y-1">
                    <Label className="text-xs text-gray-500 flex items-center gap-1">
                        <User className="w-3 h-3" /> Người tạo
                    </Label>
                    <p className="font-medium text-sm">{blog.author || 'Không rõ'}</p>
                </div>

                <div className="space-y-1">
                    <Label className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Ngày đăng
                    </Label>
                    <p className="font-medium text-sm">{formatDate(blog.createdAt)}</p>
                </div>

                <div className="space-y-1">
                    <Label className="text-xs text-gray-500 flex items-center gap-1">
                        <Eye className="w-3 h-3" /> Lượt xem
                    </Label>
                    <p className="font-medium text-sm text-blue-600">{blog.viewCount || 0} lượt</p>
                </div>

                <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Trạng thái</Label>
                    <div>
                        <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                blog.status === 'published'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-200 text-gray-700'
                            }`}
                        >
                            {blog.status === 'published' ? 'Công khai' : 'Bản nháp'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Nút Hủy / Đóng (Giống style form Create) */}
            <div className="flex justify-end pt-4 border-t mt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Đóng
                </Button>
            </div>
        </div>
    );
}
