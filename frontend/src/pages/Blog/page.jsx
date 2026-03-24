import React, { useState, Suspense, useEffect, useMemo } from 'react';
import { Search, Plus, RotateCcw, Edit, Trash2, CheckCircle, Clock, Eye, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';

// Import UI Components
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

// Import Services & Modals
import blogService from '@/services/blog/blog.api';
import { Pagination } from '@/components/Discount/pagination';
import { DeleteBlogModal } from '@/components/Blog/delete-blog-form';
import { CreateBlogModal } from '@/components/Blog/create-blog-modal';
import { ViewBlogModal } from '@/components/Blog/view-blog-modal';
import { EditBlogModal } from '@/components/Blog/edit-blog-modal';

// Helper function cho format ngày tháng
const formatDate = (dateString) => {
    if (!dateString) return '---';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '---';
        return date.toLocaleDateString('vi-VN');
    } catch {
        return 'Error';
    }
};

// Hook debounce
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export default function BlogManagementPage() {
    // --- STATE DỮ LIỆU ---
    const [blogPosts, setBlogPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentUserName, setCurrentUserName] = useState('');

    // --- STATE MODALS ---
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [blogToDelete, setBlogToDelete] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedBlogId, setSelectedBlogId] = useState(null);

    // --- STATE LỌC & PHÂN TRANG ---
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 300);
    const [statusFilter, setStatusFilter] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // --- EFFECTS ---
    useEffect(() => {
        const data_ui = JSON.parse(localStorage.getItem('data_ui'));
        if (data_ui?.userName) setCurrentUserName(data_ui.userName);
        fetchBlogs();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, statusFilter, startDate, endDate]);

    // --- ACTIONS ---
    const fetchBlogs = async () => {
        setIsLoading(true);
        try {
            const res = await blogService.getAllBlogs({});
            const responseBody = res.data ? res.data : res;
            const listData = Array.isArray(responseBody) ? responseBody : responseBody.data || [];
            setBlogPosts(listData);
        } catch {
            toast.error('Không thể tải danh sách bài viết');
            setBlogPosts([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!blogToDelete) return;
        try {
            const id = blogToDelete._id || blogToDelete.id;
            await blogService.deleteBlog(id);
            setBlogPosts((prev) => prev.filter((p) => (p._id || p.id) !== id));
            setDeleteModalOpen(false);
            setBlogToDelete(null);
            toast.success('Đã xóa bài viết thành công!');
        } catch {
            toast.error('Xóa thất bại!');
        }
    };

    const handleUpdateBlog = async (id, payload) => {
        try {
            setIsLoading(true);
            await blogService.updateBlog(id, payload);
            toast.success('Cập nhật bài viết thành công!');
            setIsEditModalOpen(false);
            fetchBlogs();
        } catch {
            toast.error('Cập nhật thất bại!');
        } finally {
            setIsLoading(false);
        }
    };

    // --- LOGIC LỌC DỮ LIỆU ---
    const filteredData = useMemo(() => {
        return blogPosts.filter((item) => {
            const query = debouncedSearch.toLowerCase().trim();
            const title = (item.title || '').toLowerCase();
            const matchesSearch = title.includes(query);
            const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

            let matchesDate = true;
            if (startDate || endDate) {
                const itemTime = new Date(item.createdAt).getTime();
                if (startDate) {
                    const start = new Date(startDate).setHours(0, 0, 0, 0);
                    if (itemTime < start) matchesDate = false;
                }
                if (endDate && matchesDate) {
                    const end = new Date(endDate).setHours(23, 59, 59, 999);
                    if (itemTime > end) matchesDate = false;
                }
            }
            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [blogPosts, debouncedSearch, statusFilter, startDate, endDate]);

    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;

    return (
        <Suspense fallback={<div>Đang tải trang...</div>}>
            <div className="min-h-screen bg-gray-100 p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Danh sách bài đăng</h1>
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                    >
                        <Plus className="w-4 h-4" /> Tạo Bài Đăng
                    </Button>
                </div>

                {/* Filter Bar */}
                <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-wrap gap-4 items-center">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Tìm tiêu đề..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <select
                        className="h-10 px-3 border rounded-md text-sm bg-white"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="published">Công khai</option>
                        <option value="draft">Nháp</option>
                    </select>
                    <div className="flex gap-2">
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-40"
                        />
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-40"
                        />
                    </div>
                    {(searchQuery || statusFilter !== 'all' || startDate || endDate) && (
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setSearchQuery('');
                                setStatusFilter('all');
                                setStartDate('');
                                setEndDate('');
                            }}
                            className="text-red-500"
                        >
                            <RotateCcw className="w-4 h-4 mr-1" /> Xóa lọc
                        </Button>
                    )}
                </div>

                {/* Table Content */}
                <div className="bg-white rounded-md border shadow-sm">
                    {isLoading ? (
                        <div className="h-40 flex items-center justify-center">
                            <RotateCcw className="animate-spin mr-2" /> Đang tải dữ liệu...
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead className="w-[80px] text-center">Ảnh</TableHead>
                                    <TableHead>Tiêu đề bài viết</TableHead>
                                    <TableHead className="text-center w-[150px]">Người tạo</TableHead>
                                    <TableHead className="text-center w-[120px]">Ngày đăng</TableHead>
                                    <TableHead className="text-center w-[100px]">Xem</TableHead>
                                    <TableHead className="text-center w-[150px]">Trạng thái</TableHead>
                                    <TableHead className="text-right w-[140px] pr-6">Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                            Không có bài viết nào.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedData.map((post) => (
                                        <TableRow key={post._id || post.id} className="hover:bg-gray-50">
                                            <TableCell className="text-center">
                                                {post.thumbnail ? (
                                                    <img
                                                        src={post.thumbnail}
                                                        className="w-10 h-10 rounded object-cover mx-auto border"
                                                        alt="thumb"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center mx-auto text-gray-400">
                                                        <ImageIcon size={18} />
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium line-clamp-2">{post.title}</TableCell>
                                            <TableCell className="text-center">{post.author || 'Admin'}</TableCell>
                                            <TableCell className="text-center">{formatDate(post.createdAt)}</TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Eye size={14} className="text-gray-400" />
                                                    {post.viewCount || 0}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    className={
                                                        post.status === 'published'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-yellow-100 text-yellow-700 shadow-none'
                                                    }
                                                >
                                                    {post.status === 'published' ? (
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                    ) : (
                                                        <Clock className="w-3 h-3 mr-1" />
                                                    )}
                                                    {post.status === 'published' ? 'Công khai' : 'Bản nháp'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right pr-4">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-blue-600"
                                                        onClick={() => {
                                                            setSelectedBlogId(post._id || post.id);
                                                            setIsViewModalOpen(true);
                                                        }}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-orange-600"
                                                        onClick={() => {
                                                            setSelectedBlogId(post._id || post.id);
                                                            setIsEditModalOpen(true);
                                                        }}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-600"
                                                        onClick={() => {
                                                            setBlogToDelete(post);
                                                            setDeleteModalOpen(true);
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </div>

                {/* Pagination */}
                {!isLoading && filteredData.length > 0 && (
                    <div className="mt-4">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={filteredData.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}

                {/* Modals */}
                <CreateBlogModal
                    isOpen={isCreateModalOpen}
                    onOpenChange={setIsCreateModalOpen}
                    onSubmit={fetchBlogs}
                    currentUser={currentUserName}
                />
                <DeleteBlogModal
                    isOpen={deleteModalOpen}
                    onOpenChange={setDeleteModalOpen}
                    blogTitle={blogToDelete?.title || ''}
                    onConfirm={handleConfirmDelete}
                />
                <ViewBlogModal isOpen={isViewModalOpen} onOpenChange={setIsViewModalOpen} blogId={selectedBlogId} />
                <EditBlogModal
                    isOpen={isEditModalOpen}
                    onOpenChange={setIsEditModalOpen}
                    blogId={selectedBlogId}
                    onSubmit={handleUpdateBlog}
                />
            </div>
        </Suspense>
    );
}
