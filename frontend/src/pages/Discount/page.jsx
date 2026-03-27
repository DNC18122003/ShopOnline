import { useState, useEffect, useMemo } from 'react';
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

// Modals (Giữ nguyên các import này)
import { DeleteDiscountModal } from '@/components/Discount/delete-discount-form';
import { CreateDiscountModal } from '@/components/Discount/create-discount-modal';
import { EditDiscountModal } from '@/components/Discount/edit-discount-modal';
import { ViewDiscountModal } from '@/components/Discount/view-discount-modal';

export default function VoucherManagement() {
    // DATA STATES
    const [rawVouchers, setRawVouchers] = useState([]); // Dữ liệu gốc từ API
    const [loading, setLoading] = useState(false);

    // FILTER & PAGINATION STATES
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');

    // Modal states
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [voucherToDelete, setVoucherToDelete] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [voucherToEdit, setVoucherToEdit] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [voucherToView, setVoucherToView] = useState(null);
    // Hàm định dạng ngày tháng cho hiển thị
    const formatDateDisplay = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        return isNaN(d.getTime()) ? '' : new Intl.DateTimeFormat('vi-VN').format(d);
    };

    // 3. LOGIC LẤY DỮ LIỆU TỪ API
    const fetchVouchers = async () => {
        setLoading(true);
        try {
            // Gọi API lấy tất cả voucher
            const res = await discountService.getAllDiscounts();
            if (res?.success) {
                const mapped = res.data.map((item) => ({
                    id: item._id,
                    code: item.code,
                    discountValue:
                        item.discountType === 'percent' ? `${item.value}%` : `${item.value?.toLocaleString()}đ`,
                    usageLimit: item.usageLimit,
                    usedCount: item.usedCount || 0,
                    startDate: formatDateDisplay(item.validFrom),
                    endDate: formatDateDisplay(item.expiredAt),
                    isActive: item.status === 'active',
                    discountType: item.discountType, // Dùng để filter
                    originalData: item,
                }));
                setRawVouchers(mapped);
            }
        } catch {
            toast.error('Không thể tải danh sách.');
        } finally {
            setLoading(false);
        }
    };
    //Gọi API
    useEffect(() => {
        fetchVouchers();
    }, []);

    // Logic lọc dữ liệu
    const filteredVouchers = useMemo(() => {
        return rawVouchers.filter((v) => {
            const matchesSearch = v.code.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = filterStatus === 'all' || (filterStatus === 'active' ? v.isActive : !v.isActive);
            const matchesType = filterType === 'all' || v.discountType === filterType;
            return matchesSearch && matchesStatus && matchesType;
        });
    }, [rawVouchers, searchQuery, filterStatus, filterType]);

    // 5. LOGIC PHÂN TRANG TẠI FE
    const displayVouchers = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredVouchers.slice(start, start + itemsPerPage);
    }, [filteredVouchers, currentPage]);

    const totalPages = Math.ceil(filteredVouchers.length / itemsPerPage);

    // Xử lý thay đổi filter
    const handleFilterChange = (setter) => (e) => {
        setter(e.target.value);
        setCurrentPage(1); // Luôn về trang 1 khi lọc
    };

    const handleResetFilter = () => {
        setFilterStatus('all');
        setFilterType('all');
        setSearchQuery('');
        setCurrentPage(1);
    };

    // Logic tạo voucher mới
    const handleCreateSubmit = async (payload) => {
        const res = await discountService.createDiscount(payload);
        if (res?.success) {
            toast.success('Tạo thành công!');
            fetchVouchers();
            return res;
        }
    };
    // Cập nhật voucher
    const handleUpdateSubmit = async (id, payload) => {
        const targetId = typeof id === 'string' ? id : voucherToEdit?.id;
        const res = await discountService.updateDiscount(targetId, payload);
        if (res?.success) {
            toast.success('Cập nhật thành công!');
            fetchVouchers();
            setIsEditModalOpen(false);
        }
    };

    const handleToggle = async (id) => {
        // Tìm voucher cần cập nhật
        const voucher = rawVouchers.find((v) => v.id === id);
        if (!voucher) return;
        const newStatus = !voucher.isActive ? 'active' : 'inactive';

        // Optimistic update (Cập nhật nhanh giao diện)
        setRawVouchers((prev) => prev.map((v) => (v.id === id ? { ...v, isActive: !v.isActive } : v)));
        const res = await discountService.updateDiscount(id, { status: newStatus });
        if (!res?.success) {
            fetchVouchers(); // Rollback nếu lỗi
            toast.error('Lỗi cập nhật');
        }
    };
    // Xử lý xóa voucher
    const handleDeleteClick = (id) => {
        const target = rawVouchers.find((v) => v.id === id);
        if (target) {
            setVoucherToDelete(target);
            setIsDeleteModalOpen(true);
        }
    };
    // Xác nhận xóa voucher
    const handleConfirmDelete = async () => {
        const res = await discountService.deleteDiscount(voucherToDelete.id);
        if (res?.success) {
            toast.success('Đã xóa');
            fetchVouchers();
        }
        setIsDeleteModalOpen(false);
    };
    // Xử lý sửa voucher
    const handleEdit = async (v) => {
        const res = await discountService.getDiscountById(v.id);
        if (res?.success) {
            setVoucherToEdit(res.data);
            setIsEditModalOpen(true);
        }
    };
    // Xử lý xem chi tiết voucher
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
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">Quản lý mã giảm giá</h1>
                        <p className="text-gray-500 text-sm">Hiển thị {filteredVouchers.length} kết quả</p>
                    </div>
                    <Button onClick={() => setIsCreateModalOpen(true)} className="bg-[#3B82F6] gap-2">
                        <Plus className="w-4 h-4" /> Tạo mã mới
                    </Button>
                </div>

                {/* Filter Bar */}
                <div className="bg-white p-4 rounded-xl border mb-6 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Tìm kiếm mã..."
                            value={searchQuery}
                            onChange={handleFilterChange(setSearchQuery)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            className="h-10 px-3 border rounded-md text-sm"
                            value={filterType}
                            onChange={handleFilterChange(setFilterType)}
                        >
                            <option value="all">Loại (Tất cả)</option>
                            <option value="percent">% Phần trăm</option>
                            <option value="fixed">₫ Cố định</option>
                        </select>
                        <select
                            className="h-10 px-3 border rounded-md text-sm"
                            value={filterStatus}
                            onChange={handleFilterChange(setFilterStatus)}
                        >
                            <option value="all">Trạng thái (Tất cả)</option>
                            <option value="active">Hoạt động</option>
                            <option value="inactive">Ngưng</option>
                        </select>
                    </div>
                    {(searchQuery || filterStatus !== 'all' || filterType !== 'all') && (
                        <Button
                            variant="ghost"
                            onClick={handleResetFilter}
                            className="text-gray-500 hover:text-red-600 gap-2"
                        >
                            <RotateCcw className="w-4 h-4" /> Xóa lọc
                        </Button>
                    )}
                </div>

                {/* Content */}
                <div className="bg-white rounded-xl border shadow-sm min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-500">Đang tải...</p>
                        </div>
                    ) : (
                        <>
                            <VoucherTable
                                vouchers={displayVouchers}
                                onToggle={handleToggle}
                                onEdit={handleEdit}
                                onDelete={handleDeleteClick}
                                onCopyCode={(code) => {
                                    navigator.clipboard.writeText(code);
                                    toast.success(`Đã copy: ${code}`);
                                }}
                                onView={handleView}
                            />
                            {filteredVouchers.length === 0 && (
                                <div className="text-center py-16">
                                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-gray-900">Không tìm thấy mã nào</h3>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Pagination (FE xử lý) */}
                {!loading && filteredVouchers.length > 0 && (
                    <div className="mt-6">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={filteredVouchers.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}

                {/* Modals (Giữ nguyên các Modal ở cuối) */}
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
// Component con cho bảng voucher
function VoucherTable({ vouchers, onToggle, onEdit, onDelete, onCopyCode, onView }) {
    return (
        // Bảng hiển thị voucher
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
                    {/* Duyệt qua danh sách voucher và hiển thị từng dòng trong bảng */}
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
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                <span className="text-lg font-semibold text-gray-900">{voucher.discountValue}</span>
                            </TableCell>
                            <TableCell className="text-center">
                                <span className="text-gray-600">Giới hạn: {voucher.usageLimit}</span>
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
                                        className="text-gray-400 hover:text-blue-600"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onEdit(voucher)}
                                        className="text-gray-400 hover:text-orange-600"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onDelete(voucher.id)}
                                        className="text-gray-400 hover:text-red-600"
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
