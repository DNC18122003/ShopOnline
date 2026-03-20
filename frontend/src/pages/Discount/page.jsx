import { useState, useEffect } from 'react';
import { Search, Plus, RotateCcw, Pencil, Trash2, Copy, Eye } from 'lucide-react';

// UI Components
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Pagination } from '@/components/Discount/pagination';

// Services & Tools
import discountService from '@/services/discount/discount.api';
import { toast } from 'react-toastify';

// Modals
import { DeleteDiscountModal } from '@/components/Discount/delete-discount-form';
import { CreateDiscountModal } from '@/components/Discount/create-discount-modal';
import { EditDiscountModal } from '@/components/Discount/edit-discount-modal';
import { ViewDiscountModal } from '@/components/Discount/view-discount-modal';

function VoucherTable({ vouchers, onToggle, onEdit, onDelete, onCopyCode, onView }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50/50">
                        <TableHead className="text-gray-500 font-medium text-center">Mã giảm giá</TableHead>
                        <TableHead className="text-gray-500 font-medium text-center">Giá trị giảm giá</TableHead>
                        <TableHead className="text-gray-500 font-medium text-center">Giới hạn sử dụng</TableHead>
                        <TableHead className="text-gray-500 font-medium text-center">Khoảng thời gian</TableHead>
                        <TableHead className="text-gray-500 font-medium text-center">Trạng thái</TableHead>
                        <TableHead className="text-gray-500 font-medium text-center">Hành động</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {vouchers.map((voucher) => (
                        <TableRow key={voucher.id} className="border-b border-gray-100">
                            <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#DBEAFE] text-[#3B82F6] border border-[#93C5FD]">
                                        {voucher.code}
                                    </span>
                                    <button
                                        onClick={() => onCopyCode(voucher.code)}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                        title="Sao chép mã"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                <span className="text-lg font-semibold text-gray-900">{voucher.discountValue}</span>
                            </TableCell>
                            <TableCell className="text-center">
                                <span className="text-gray-600">Giới hạn: {voucher.usageLimit} người dùng</span>
                                <span className="text-gray-400 text-sm ml-1">({voucher.usedCount} đã dùng)</span>
                            </TableCell>
                            <TableCell className="text-center text-gray-600">
                                {voucher.startDate} - {voucher.endDate}
                            </TableCell>
                            <TableCell className="text-center">
                                <div className="flex justify-center">
                                    <Switch
                                        checked={voucher.isActive}
                                        onCheckedChange={() => onToggle(voucher.id)}
                                        className="data-[state=checked]:bg-[#3B82F6]"
                                    />
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onView(voucher)}
                                        className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                        title="Xem chi tiết"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onEdit(voucher)}
                                        className="h-8 w-8 text-gray-400 hover:text-orange-600 hover:bg-orange-50"
                                        title="Chỉnh sửa"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onDelete(voucher.id)}
                                        className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                        title="Xóa"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

/** MAIN PAGE COMPONENT */
export default function VoucherManagement() {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(false);

    // State phân trang & Filter
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');

    // Modal States
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [voucherToDelete, setVoucherToDelete] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [voucherToEdit, setVoucherToEdit] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [voucherToView, setVoucherToView] = useState(null);

    // Helper: Format ngày
    const formatDateDisplay = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        return isNaN(d.getTime())
            ? ''
            : new Intl.DateTimeFormat('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
              }).format(d);
    };

    const fetchVouchers = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                code: searchQuery,
                status: filterStatus !== 'all' ? filterStatus : undefined,
                discountType: filterType !== 'all' ? filterType : undefined,
            };
            const res = await discountService.getAllDiscounts(params);
            if (res?.success) {
                const mappedVouchers = res.data.map((item) => ({
                    id: item._id,
                    code: item.code,
                    discountValue:
                        item.discountType === 'percent' ? `${item.value}%` : `${item.value?.toLocaleString()}đ`,
                    usageLimit: item.usageLimit,
                    usedCount: item.usedCount || 0,
                    startDate: formatDateDisplay(item.validFrom),
                    endDate: formatDateDisplay(item.expiredAt),
                    isActive: item.status === 'active',
                    originalData: item,
                }));
                setVouchers(mappedVouchers);
                setTotalItems(res.count || 0);
                setTotalPages(Math.ceil((res.count || 0) / itemsPerPage));
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách:', error); // Thêm dòng này
            toast.error('Không thể tải danh sách mã giảm giá.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchVouchers(), 500);
        return () => clearTimeout(timer);
    }, [currentPage, searchQuery, filterStatus, filterType]);

    const handleFilterChange = (setter) => (e) => {
        setter(e.target.value);
        setCurrentPage(1);
    };

    const handleResetFilter = () => {
        setFilterStatus('all');
        setFilterType('all');
        setSearchQuery('');
        setCurrentPage(1);
    };

    // Logic xử lý CRUD
    const handleCreateSubmit = async (payload) => {
        const res = await discountService.createDiscount(payload);
        if (res?.success) {
            toast.success('Tạo mã giảm giá thành công!');
            fetchVouchers();
            return res;
        }
        throw new Error(res?.message || 'Mã giảm giá không hợp lệ');
    };

    const handleUpdateSubmit = async (param1, param2) => {
        let id = typeof param1 === 'string' ? param1 : voucherToEdit?._id || voucherToEdit?.id;
        let payload = typeof param1 === 'object' ? param1 : param2;

        const res = await discountService.updateDiscount(id, payload);
        if (res?.success) {
            toast.success('Cập nhật thành công!');
            fetchVouchers();
            setIsEditModalOpen(false);
            return res;
        }
        throw new Error(res?.message || 'Cập nhật thất bại');
    };

    const handleToggle = async (id) => {
        const voucher = vouchers.find((v) => v.id === id);
        if (!voucher) return;
        const newStatus = !voucher.isActive ? 'active' : 'inactive';
        setVouchers((prev) => prev.map((v) => (v.id === id ? { ...v, isActive: !v.isActive } : v)));

        const res = await discountService.updateDiscount(id, { status: newStatus });
        if (!res?.success) {
            fetchVouchers();
            toast.error('Không thể cập nhật trạng thái');
        } else {
            toast.success(`Trạng thái: ${newStatus === 'active' ? 'Hoạt động' : 'Ngưng'}`);
        }
    };

    const handleDeleteClick = (id) => {
        const target = vouchers.find((v) => v.id === id);
        if (target) {
            setVoucherToDelete(target);
            setIsDeleteModalOpen(true);
        }
    };

    const handleConfirmDelete = async () => {
        const res = await discountService.deleteDiscount(voucherToDelete.id);
        if (res?.success) {
            toast.success('Đã xóa mã giảm giá');
            vouchers.length === 1 && currentPage > 1 ? setCurrentPage(currentPage - 1) : fetchVouchers();
        }
        setIsDeleteModalOpen(false);
    };

    const handleEdit = async (v) => {
        const res = await discountService.getDiscountById(v.id);
        if (res?.success) {
            setVoucherToEdit(res.data);
            setIsEditModalOpen(true);
        }
    };

    const handleView = async (v) => {
        const res = await discountService.getDiscountById(v.id);
        if (res?.success) {
            setVoucherToView(res.data);
            setIsViewModalOpen(true);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <main className="p-8 max-w-[1600px] mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý mã giảm giá</h1>
                        <p className="text-gray-500 text-sm mt-1">Tạo và quản lý các chương trình khuyến mãi của bạn</p>
                    </div>
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-[#3B82F6] hover:bg-[#2563EB] text-white gap-2 shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> Tạo mã mới
                    </Button>
                </div>

                {/* Filter Bar */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Tìm kiếm theo mã code..."
                                value={searchQuery}
                                onChange={handleFilterChange(setSearchQuery)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                className="h-10 px-3 border rounded-md bg-white text-sm"
                                value={filterType}
                                onChange={handleFilterChange(setFilterType)}
                            >
                                <option value="all">Loại (Tất cả)</option>
                                <option value="percent">% Phần trăm</option>
                                <option value="fixed">₫ Cố định</option>
                            </select>
                            <select
                                className="h-10 px-3 border rounded-md bg-white text-sm"
                                value={filterStatus}
                                onChange={handleFilterChange(setFilterStatus)}
                            >
                                <option value="all">Trạng thái (Tất cả)</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        {(filterStatus !== 'all' || filterType !== 'all' || searchQuery) && (
                            <Button
                                variant="ghost"
                                onClick={handleResetFilter}
                                className="text-gray-500 hover:text-red-600 gap-2"
                            >
                                <RotateCcw className="w-4 h-4" /> Xóa bộ lọc
                            </Button>
                        )}
                    </div>
                </div>

                {/* Table Content */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-500 text-sm">Đang tải dữ liệu...</p>
                        </div>
                    ) : (
                        <VoucherTable
                            vouchers={vouchers}
                            onToggle={handleToggle}
                            onEdit={handleEdit}
                            onDelete={handleDeleteClick}
                            onCopyCode={(code) => {
                                navigator.clipboard.writeText(code);
                                toast.success(`Đã copy: ${code}`);
                            }}
                            onView={handleView}
                        />
                    )}

                    {!loading && vouchers.length === 0 && (
                        <div className="text-center py-16">
                            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">Không tìm thấy kết quả</h3>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {!loading && totalItems > 0 && (
                    <div className="mt-6">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}

                {/* Modals */}
                <DeleteDiscountModal
                    isOpen={isDeleteModalOpen}
                    onOpenChange={setIsDeleteModalOpen}
                    discountCode={voucherToDelete?.code || ''}
                    onConfirm={handleConfirmDelete}
                />
                <CreateDiscountModal
                    isOpen={isCreateModalOpen}
                    onOpenChange={setIsCreateModalOpen}
                    onSubmit={handleCreateSubmit}
                />
                <EditDiscountModal
                    isOpen={isEditModalOpen}
                    onOpenChange={setIsEditModalOpen}
                    voucherData={voucherToEdit}
                    onSubmit={handleUpdateSubmit}
                />
                <ViewDiscountModal
                    isOpen={isViewModalOpen}
                    onOpenChange={setIsViewModalOpen}
                    voucherData={voucherToView}
                />
            </main>
        </div>
    );
}
