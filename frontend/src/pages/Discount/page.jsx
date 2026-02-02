import { useState, useEffect, Suspense } from "react"
import { Search, Plus } from "lucide-react"
import { VoucherTable } from "@/components/Discount/voucher-table"
import { Pagination } from "@/components/Discount/pagination"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loading } from "@/components/Discount/loading"
import { toast } from "react-toastify" 
import discountService from "@/services/discount/discount.api";

// 1. IMPORT CÁC MODAL
import { DeleteDiscountModal } from "@/components/Discount/delete-discount-form" 
import { CreateDiscountModal } from "@/components/Discount/create-discount-modal"

export default function VoucherManagement() {
  const [vouchers, setVouchers] = useState([])
  const [loading, setLoading] = useState(false)
  
  // State phân trang
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 10; 

  // --- CÁC STATE FILTER ---
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all") 
  const [filterType, setFilterType] = useState("all")

  // State cho Modal Xóa
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [voucherToDelete, setVoucherToDelete] = useState(null) 

  // --- 2. STATE CHO MODAL TẠO MỚI ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Hàm lấy dữ liệu từ API
  const fetchVouchers = async () => {
    setLoading(true)
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        code: searchQuery,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        discountType: filterType !== 'all' ? filterType : undefined,
      };

      const res = await discountService.getAllDiscounts(params);

      if (res && res.success) {
        const mappedVouchers = res.data.map(item => ({
          id: item._id, 
          code: item.code,
          discountValue: item.discountType === 'percent' ? `${item.value}%` : `${item.value.toLocaleString()}đ`,
          usageLimit: item.usageLimit,
          usedCount: item.usedCount || 0,
          startDate: new Date(item.validFrom).toLocaleDateString('en-GB', { 
            day: '2-digit', month: '2-digit', year: 'numeric' 
          }),
          endDate: new Date(item.expiredAt).toLocaleDateString('en-GB', { 
            day: '2-digit', month: '2-digit', year: 'numeric' 
          }),
          isActive: item.status === 'active'
        }));

        setVouchers(mappedVouchers);
        const total = res.count || 0;
        setTotalItems(total);
        setTotalPages(Math.ceil(total / itemsPerPage));
      }
    } catch (error) {
      console.error("Lỗi tải danh sách mã:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVouchers();
    }, 500);
    return () => clearTimeout(timer);
  }, [currentPage, searchQuery, filterStatus, filterType]);

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setCurrentPage(1);
  }

  const handleToggle = async (id) => {
    try {
        const voucher = vouchers.find(v => v.id === id);
        if (!voucher) return;
        const newStatus = !voucher.isActive ? 'active' : 'inactive';
        const res = await discountService.updateDiscount(id, { status: newStatus });
        if(res && res.success) {
            toast.success("Cập nhật thành công");
            setVouchers((prev) => prev.map((v) => (v.id === id ? { ...v, isActive: !v.isActive } : v)));
        }
    } catch (error) { toast.error("Lỗi cập nhật"); }
  }

  const handleDeleteClick = (id) => {
    const targetVoucher = vouchers.find(v => v.id === id);
    if (targetVoucher) {
        setVoucherToDelete(targetVoucher);
        setIsDeleteModalOpen(true);
    }
  }

  const handleConfirmDelete = async () => {
    if (!voucherToDelete) return;
    try {
        const res = await discountService.deleteDiscount(voucherToDelete.id);
        if(res && res.success) {
            toast.success("Đã xóa mã giảm giá");
            if (vouchers.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            } else {
                fetchVouchers();
            }
        }
    } catch (error) { 
        toast.error("Xóa thất bại"); 
    } finally {
        setVoucherToDelete(null);
    }
  }

  // --- 3. LOGIC XỬ LÝ KHI SUBMIT FORM TẠO MỚI ---
  // Modal của bạn trả về `data` qua prop onSubmit, nên ta gọi API tại đây
  const handleCreateSubmit = async (formData) => {
    try {
        // Gọi API tạo mới (giả sử bạn có hàm createDiscount trong service)
        const res = await discountService.createDiscount(formData);
        
        if (res && res.success) {
            toast.success("Tạo mã giảm giá thành công!");
            fetchVouchers(); // Load lại bảng dữ liệu
            // Modal tự đóng nhờ logic trong component CreateDiscountModal (onOpenChange(false))
        } else {
             // Nếu API trả về lỗi
             toast.error(res?.message || "Tạo thất bại");
        }
    } catch (error) {
        console.error(error);
        toast.error("Đã có lỗi xảy ra khi tạo mã.");
    }
  }

  const handleEdit = (voucher) => { console.log("Edit voucher:", voucher) }

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
    toast.success("Copied: " + code)
  }

  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen bg-gray-100"> 
        <main className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Mã giảm giá</h1>
            <div className="flex items-center gap-4">
              
              {/* Nút bật Modal */}
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-[#3B82F6] hover:bg-[#2563EB] text-white gap-2"
              >
                <Plus className="w-4 h-4" />
                Tạo mã giảm giá
              </Button>

            </div>
          </div>

          {/* Filter Area (Giữ nguyên) */}
          <div className="flex flex-wrap items-center gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm mã...."
                value={searchQuery}
                onChange={handleFilterChange(setSearchQuery)}
                className="pl-10 border-gray-200"
              />
            </div>
            {/* ... Các select filter giữ nguyên ... */}
            <div className="relative min-w-[150px]">
                <select 
                    className="w-full h-10 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filterType}
                    onChange={handleFilterChange(setFilterType)}
                >
                    <option value="all">Tất cả loại</option>
                    <option value="percent">Theo phần trăm (%)</option>
                    <option value="fixed">Tiền cố định (VND)</option>
                </select>
            </div>
            <div className="relative min-w-[150px]">
                <select 
                    className="w-full h-10 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filterStatus}
                    onChange={handleFilterChange(setFilterStatus)}
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="inactive">Ngưng hoạt động</option>
                </select>
            </div>
             {(filterStatus !== 'all' || filterType !== 'all' || searchQuery) && (
                <Button 
                    variant="ghost" 
                    onClick={() => {
                        setFilterStatus("all");
                        setFilterType("all");
                        setSearchQuery("");
                        setCurrentPage(1);
                    }}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                    Xóa bộ lọc
                </Button>
             )}
          </div>

          {/* Table */}
          {loading ? (
             <div className="text-center py-10">Đang tải dữ liệu...</div>
          ) : (
             <VoucherTable
                vouchers={vouchers}
                onToggle={handleToggle}
                onEdit={handleEdit}
                onDelete={handleDeleteClick} 
                onCopyCode={handleCopyCode}
             />
          )}

          {!loading && totalItems > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
          )}

          {/* --- KHU VỰC CÁC MODAL --- */}
          
          <DeleteDiscountModal 
            isOpen={isDeleteModalOpen}
            onOpenChange={setIsDeleteModalOpen}
            discountCode={voucherToDelete?.code || ""}
            onConfirm={handleConfirmDelete}
          />

          {/* --- 4. SỬ DỤNG COMPONENT CreateDiscountModal --- */}
          <CreateDiscountModal 
            isOpen={isCreateModalOpen}
            onOpenChange={setIsCreateModalOpen}
            onSubmit={handleCreateSubmit}
          />

        </main>
      </div>
    </Suspense>
  )
}