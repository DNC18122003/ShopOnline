import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, User, Calendar, Eye, Image as ImageIcon, AlertCircle } from 'lucide-react';

export function EditBlogForm({ blogId, onSubmit, onCancel }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorText, setErrorText] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        thumbnail: '',
        status: 'published',
        author: '',
        createdAt: '',
        viewCount: 0,
    });

    useEffect(() => {
        if (!blogId) return;

        const fetchBlogDetail = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`http://localhost:9999/api/blogs/${blogId}`);
                const result = await response.json();

                if (result.success && result.data) {
                    setFormData({
                        title: result.data.title || '',
                        content: result.data.content || '',
                        thumbnail: result.data.thumbnail || '',
                        status: result.data.status || 'published',
                        author: result.data.author || 'Không xác định',
                        createdAt: result.data.createdAt || '',
                        viewCount: result.data.viewCount || 0,
                    });
                }
            } catch (error) {
                console.error('Lỗi khi fetch chi tiết bài viết:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBlogDetail();
    }, [blogId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errorText) setErrorText('');
    };

    // ---> HÀM ĐÃ ĐƯỢC SỬA ĐỂ PHÙ HỢP VỚI STATE CỦA EDIT FORM <---
    const handleThumbnailChange = (e) => {
        setErrorText('');
        const file = e.target.files?.[0];
        if (!file) return;

        // 1. Kiểm tra định dạng ảnh
        if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
            setFormData((prev) => ({ ...prev, thumbnail: '' })); // Xóa ảnh trên form
            e.target.value = ''; // Xóa ảnh trong bộ nhớ input
            setErrorText('Lỗi: Định dạng ảnh phải là PNG hoặc JPG.');
            return;
        }

        // 2. Kiểm tra dung lượng ảnh (Tối đa 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setFormData((prev) => ({ ...prev, thumbnail: '' })); // Xóa ảnh trên form
            e.target.value = ''; // Xóa ảnh trong bộ nhớ input
            setErrorText('Lỗi: Kích thước ảnh không được vượt quá 5MB.');
            return;
        }

        // 3. NẾU ẢNH HỢP LỆ -> Cập nhật ảnh vào formData
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData((prev) => ({ ...prev, thumbnail: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    // ---> HÀM ĐÃ ĐƯỢC CHUẨN HOÁ VALIDATE (THÊM TRIM) <---
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Loại bỏ dấu cách thừa ở đầu/cuối
        const validTitle = formData.title.trim();
        const validContent = formData.content.trim();

        if (!formData.thumbnail) {
            setErrorText('Lỗi: Vui lòng chọn ảnh bài viết.');
            return;
        }
        if (!validTitle) {
            setErrorText('Lỗi: Vui lòng điền đầy đủ tiêu đề.');
            return;
        }
        if (validTitle.length > 50) {
            setErrorText('Lỗi: Tiêu đề bài viết không được vượt quá 50 ký tự.');
            return;
        }
        if (!validContent) {
            setErrorText('Lỗi: Vui lòng điền đầy đủ nội dung.');
            return;
        }
        if (validContent.length > 10000) {
            setErrorText('Lỗi: Nội dung bài viết không được vượt quá 10000 ký tự.');
            return;
        }

        setIsSubmitting(true);
        try {
            const updatePayload = {
                title: validTitle, // Dùng giá trị đã trim
                content: validContent, // Dùng giá trị đã trim
                thumbnail: formData.thumbnail,
                status: formData.status,
            };
            await onSubmit(blogId, updatePayload);

            // Gọi onCancel() để tự động đóng form nếu truyền từ ngoài vào
            if (typeof onCancel === 'function') {
                onCancel();
            }
        } catch (error) {
            console.error('Lỗi submit:', error);
            setErrorText(error.message || 'Đã xảy ra lỗi khi cập nhật bài viết.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'Chưa cập nhật';
        const date = new Date(dateString);
        const time = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const day = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        return `${time} ${day}`;
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
                <p className="text-gray-500">Đang tải dữ liệu cũ...</p>
            </div>
        );
    }

    const isImageError = errorText.includes('ảnh') || errorText.includes('định dạng');
    const isTitleError = (errorText.includes('tiêu đề') && !formData.title.trim()) || errorText.includes('Tiêu đề');
    const isContentError =
        (errorText.includes('nội dung') && !formData.content.trim()) || errorText.includes('Nội dung');

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {errorText && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                    <p className="text-sm text-red-600 leading-tight">
                        <span className="font-bold">Lỗi:</span> {errorText.replace('Lỗi: ', '')}
                    </p>
                </div>
            )}

            <div className="space-y-2">
                <Label className="font-bold">
                    Ảnh bài viết<span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-4">
                    <div className="w-24 h-24 border rounded-md overflow-hidden bg-gray-50 flex items-center justify-center flex-shrink-0">
                        {formData.thumbnail ? (
                            <img src={formData.thumbnail} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                            <ImageIcon className="w-8 h-8 text-gray-300" />
                        )}
                    </div>

                    <div className="flex-1">
                        <Input
                            type="file"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleThumbnailChange}
                            className={`cursor-pointer h-9 text-sm ${
                                isImageError ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-200'
                            }`}
                        />
                        <p className="text-xs text-gray-500 mt-2">PNG, JPG tối đa 5MB</p>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label className="font-bold">
                    Tiêu đề bài viết<span className="text-red-500">*</span>
                </Label>
                <Input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Nhập tiêu đề..."
                    className={isTitleError ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
            </div>

            <div className="space-y-2">
                <Label className="font-bold">
                    Nội dung bài viết<span className="text-red-500">*</span>
                </Label>
                <Textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    className={`min-h-[150px] ${isContentError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    placeholder="Viết nội dung tại đây..."
                />
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border grid grid-cols-2 gap-4 text-sm mt-2">
                <div>
                    <p className="flex items-center gap-2 text-gray-500 mb-1">
                        <User className="w-4 h-4" /> Người tạo
                    </p>
                    <p className="font-medium text-gray-900">{formData.author}</p>
                </div>

                <div>
                    <p className="flex items-center gap-2 text-gray-500 mb-1">
                        <Calendar className="w-4 h-4" /> Ngày đăng
                    </p>
                    <p className="font-medium text-gray-900">{formatDateTime(formData.createdAt)}</p>
                </div>

                <div>
                    <p className="flex items-center gap-2 text-gray-500 mb-1">
                        <Eye className="w-4 h-4" /> Lượt xem
                    </p>
                    <p className="font-medium text-blue-600">{formData.viewCount} lượt</p>
                </div>

                <div>
                    <p className="flex items-center gap-2 text-gray-500 mb-2 font-bold">Trạng thái</p>
                    <div className="flex gap-4 items-center">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="status"
                                value="published"
                                checked={formData.status === 'published'}
                                onChange={handleChange}
                                className="accent-blue-600"
                            />
                            <span>Công khai</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="status"
                                value="draft"
                                checked={formData.status === 'draft'}
                                onChange={handleChange}
                                className="accent-blue-600"
                            />
                            <span>Bản nháp</span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                    Hủy
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Cập nhật
                </Button>
            </div>
        </form>
    );
}
