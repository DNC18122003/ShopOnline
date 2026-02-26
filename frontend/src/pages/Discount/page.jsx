import { useState, useEffect, Suspense } from "react";
import { Search, Plus, RotateCcw } from "lucide-react"; // Thêm icon RotateCcw để reset filter đẹp hơn

import { VoucherTable } from "@/components/Discount/voucher-table";
import { Pagination } from "@/components/Discount/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/Discount/loading";

// Thay đổi đường dẫn import này tùy theo cấu trúc project của bạn
import discountService from "@/services/discount/discount.api";
import { toast } from "react-toastify"; // Hoặc dùng sonner/toast tùy thư viện bạn cài

// IMPORT CÁC MODAL
import { DeleteDiscountModal } from "@/components/Discount/delete-discount-form";
import { CreateDiscountModal } from "@/components/Discount/create-discount-modal";
import { EditDiscountModal } from "@/components/Discount/edit-discount-modal";
import { ViewDiscountModal } from "@/components/Discount/view-discount-modal";

export default function VoucherManagement() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);

  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // State filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  // Modal Delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [voucherToDelete, setVoucherToDelete] = useState(null);

  // Modal Create
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Modal Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [voucherToEdit, setVoucherToEdit] = useState(null);

  // Modal View
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [voucherToView, setVoucherToView] = useState(null);

  // Helper: Format ngày hiển thị (dd/mm/yyyy)
  const formatDateDisplay = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";
    try {
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(d);
    } catch (e) {
      return "";
    }
  };

  // 1. LẤY DỮ LIỆU TỪ API
  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        code: searchQuery, // Search theo mã
        status: filterStatus !== "all" ? filterStatus : undefined,
        discountType: filterType !== "all" ? filterType : undefined,
      };

      const res = await discountService.getAllDiscounts(params);

      if (res && res.success) {
        // Map dữ liệu từ Backend sang format của Frontend Table
        const mappedVouchers = res.data.map((item) => ({
          id: item._id, // Lưu ý: MongoDB thường trả về _id
          code: item.code,
          discountValue:
            item.discountType === "percent" // Kiểm tra đúng value backend trả về
              ? `${item.value}%`
              : `${item.value?.toLocaleString()}đ`,
          usageLimit: item.usageLimit,
          usedCount: item.usedCount || 0,
          startDate: formatDateDisplay(item.validFrom),
          endDate: formatDateDisplay(item.expiredAt),
          isActive: item.status === "active",
          // Lưu lại raw data để dùng cho Edit/View nếu cần
          originalData: item 
        }));

        setVouchers(mappedVouchers);
        const total = res.count || 0; // Hoặc res.totalItems tùy API trả về
        setTotalItems(total);
        setTotalPages(Math.ceil(total / itemsPerPage));
      }
    } catch (error) {
      console.error("Lỗi tải danh sách mã:", error);
      toast.error("Không thể tải danh sách mã giảm giá.");
    } finally {
      setLoading(false);
    }
  };

  // Debounce search: Chỉ gọi API khi ngừng gõ 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVouchers();
    }, 500);
    return () => clearTimeout(timer);
  }, [currentPage, searchQuery, filterStatus, filterType]);

  // Xử lý thay đổi Filter
  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setCurrentPage(1); // Reset về trang 1 khi filter
  };

  // Xử lý Reset Filter
  const handleResetFilter = () => {
    setFilterStatus("all");
    setFilterType("all");
    setSearchQuery("");
    setCurrentPage(1);
  }

  // 2. XỬ LÝ TẠO MỚI (QUAN TRỌNG)
  const handleCreateSubmit = async (payload) => {
    try {
      // Gọi API
      const res = await discountService.createDiscount(payload);

      // Kiểm tra Logic Business
      if (res && res.success) {
        toast.success("Tạo mã giảm giá thành công!");
        
        // Refresh lại bảng dữ liệu
        fetchVouchers(); 
        
        // CHÚ Ý: Không gọi setIsCreateModalOpen(false) ở đây.
        // Component CreateDiscountModal sẽ tự đóng khi hàm này resolve thành công.
        return res; 
      } else {
        // Nếu API trả về 200 OK nhưng success: false (Business Error)
        const errorMsg = res?.message || "Mã giảm giá đã tồn tại hoặc không hợp lệ";
        throw new Error(errorMsg);
      }
    } catch (error) {
      // Log lỗi và ném tiếp (throw) để Modal/Form con bắt được và hiện chữ đỏ
      console.error("Lỗi khi tạo mã:", error);
      throw error; 
    }
  };

  // 3. XỬ LÝ CẬP NHẬT
  const handleUpdateSubmit = async (updatedData) => {
    try {
      const id = updatedData._id || updatedData.id;
      const res = await discountService.updateDiscount(id, updatedData);

      if (res && res.success) {
        toast.success("Cập nhật thành công!");
        fetchVouchers();
        
        // Với Edit Modal, nếu bạn chưa sửa Modal đó sang async/await giống Create
        // thì vẫn giữ dòng này để đóng form thủ công.
        setIsEditModalOpen(false); 
        setVoucherToEdit(null);
        return res;
      } else {
        throw new Error(res?.message || "Cập nhật thất bại");
      }
    } catch (error) {
      console.error("Update error:", error);
      // Nếu EditModal chưa xử lý error, ta hiện toast
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật");
      throw error;
    }
  };

  // 4. XỬ LÝ TOGGLE TRẠNG THÁI (Active/Inactive)
  const handleToggle = async (id) => {
    try {
      const voucher = vouchers.find((v) => v.id === id);
      if (!voucher) return;

      const newStatus = !voucher.isActive ? "active" : "inactive";
      // Giả lập update UI ngay lập tức (Optimistic UI)
      setVouchers((prev) =>
          prev.map((v) => v.id === id ? { ...v, isActive: !v.isActive } : v)
      );

      const res = await discountService.updateDiscount(id, {
        status: newStatus,
      });

      if (!res || !res.success) {
         // Revert nếu lỗi
         setVouchers((prev) =>
            prev.map((v) => v.id === id ? { ...v, isActive: !v.isActive } : v)
         );
         toast.error(res?.message || "Không thể cập nhật trạng thái");
      } else {
         toast.success(`Đã chuyển sang trạng thái ${newStatus === 'active' ? 'Hoạt động' : 'Ngưng hoạt động'}`);
      }
    } catch (error) {
      toast.error("Lỗi kết nối server");
      fetchVouchers(); // Load lại data chuẩn từ server
    }
  };

  // 5. XỬ LÝ XÓA
  const handleDeleteClick = (id) => {
    const targetVoucher = vouchers.find((v) => v.id === id);
    if (targetVoucher) {
      setVoucherToDelete(targetVoucher);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!voucherToDelete) return;
    try {
      const res = await discountService.deleteDiscount(voucherToDelete.id);
      if (res && res.success) {
        toast.success("Đã xóa mã giảm giá");
        
        // Logic lùi trang nếu xóa hết item ở trang cuối
        if (vouchers.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchVouchers();
        }
      } else {
         toast.error(res?.message || "Xóa thất bại");
      }
    } catch (error) {
      toast.error("Lỗi hệ thống khi xóa");
    } finally {
      // Đóng modal ở finally để đảm bảo modal luôn đóng dù lỗi hay không (với delete thì ok)
      setIsDeleteModalOpen(false); 
      setVoucherToDelete(null);
    }
  };

  // 6. XỬ LÝ EDIT & VIEW
  const handleEdit = async (voucherFromTable) => {
    // Nếu trong bảng đã có full data thì dùng luôn, không cần gọi API getById
    // Tuy nhiên gọi API getById vẫn an toàn nhất để lấy data mới nhất
    try {
      const id = voucherFromTable.id;
      const res = await discountService.getDiscountById(id);
      if (res && res.success) {
        setVoucherToEdit(res.data);
        setIsEditModalOpen(true);
      } else {
        toast.error("Không thể lấy thông tin chi tiết");
      }
    } catch (error) {
      toast.error("Lỗi kết nối");
    }
  };

  const handleView = async (voucherFromTable) => {
    try {
      const id = voucherFromTable.id;
      const res = await discountService.getDiscountById(id);
      if (res && res.success) {
        setVoucherToView(res.data);
        setIsViewModalOpen(true);
      } else {
        toast.error("Không thể tải chi tiết mã");
      }
    } catch (error) {
      toast.error("Lỗi kết nối");
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã sao chép: ${code}`);
  };

  return (
    <Suspense fallback={<Loading />}>
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
              className="bg-[#3B82F6] hover:bg-[#2563EB] text-white gap-2 shadow-sm transition-all hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              Tạo mã mới
            </Button>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
             <div className="flex flex-col md:flex-row gap-4 items-center">
                {/* Search */}
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm theo mã code..."
                    value={searchQuery}
                    onChange={handleFilterChange(setSearchQuery)}
                    className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <select
                        className="h-10 px-3 py-2 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        value={filterType}
                        onChange={handleFilterChange(setFilterType)}
                    >
                        <option value="all">Loại giảm giá (Tất cả)</option>
                        <option value="percent">% Phần trăm</option>
                        <option value="fixed">₫ Tiền cố định</option>
                    </select>

                    <select
                        className="h-10 px-3 py-2 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        value={filterStatus}
                        onChange={handleFilterChange(setFilterStatus)}
                    >
                        <option value="all">Trạng thái (Tất cả)</option>
                        <option value="active">Active (Hoạt động)</option>
                        <option value="inactive">Inactive (Ngưng)</option>
                    </select>
                </div>

                {/* Reset Button */}
                {(filterStatus !== "all" || filterType !== "all" || searchQuery) && (
                  <Button
                    variant="ghost"
                    onClick={handleResetFilter}
                    className="text-gray-500 hover:text-red-600 hover:bg-red-50 gap-2 ml-auto md:ml-0"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Xóa bộ lọc
                  </Button>
                )}
             </div>
          </div>

          {/* Table Content */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
             {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    {/* Bạn có thể thay bằng Component Loading skeleton */}
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 text-sm">Đang tải dữ liệu...</p>
                </div>
              ) : (
                <VoucherTable
                  vouchers={vouchers}
                  onToggle={handleToggle}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onCopyCode={handleCopyCode}
                  onView={handleView}
                />
              )}
              
              {/* Empty State */}
              {!loading && vouchers.length === 0 && (
                  <div className="text-center py-16">
                      <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Search className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">Không tìm thấy kết quả</h3>
                      <p className="text-gray-500 mt-1">Thử thay đổi bộ lọc hoặc tạo mã giảm giá mới.</p>
                  </div>
              )}
          </div>

          {/* Pagination */}
          {!loading && totalItems > 0 && (
             <div className="mt-6">
                 {totalPages > 1 ? (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                 ) : (
                    <p className="text-center text-sm text-gray-500">
                        Hiển thị toàn bộ {totalItems} kết quả
                    </p>
                 )}
             </div>
          )}

          {/* ----- MODALS ----- */}
          
          <DeleteDiscountModal
            isOpen={isDeleteModalOpen}
            onOpenChange={setIsDeleteModalOpen}
            discountCode={voucherToDelete?.code || ""}
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
    </Suspense>
  );
}