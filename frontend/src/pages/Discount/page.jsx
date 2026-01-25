import { useState, Suspense } from "react"
import { Search, ChevronDown, Calendar, Filter, Plus } from "lucide-react"
import { Sidebar } from "@/components/layouts/Discount/sidebar"
import { VoucherTable } from "@/components/layouts/Discount/voucher-table"
import { Pagination } from "@/components/layouts/Discount/pagination"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loading } from "@/components/layouts/Discount/loading"

const initialVouchers = [
  {
    id: "1",
    code: "SUMMER2024",
    discountValue: "25%",
    usageLimit: 500,
    usedCount: 342,
    startDate: "Jun 1, 2024",
    endDate: "Aug 31, 2024",
    isActive: true,
  },
  {
    id: "2",
    code: "NEWUSER50",
    discountValue: "$50",
    usageLimit: 1000,
    usedCount: 89,
    startDate: "Jun 1, 2024",
    endDate: "Aug 31, 2024",
    isActive: true,
  },
  {
    id: "3",
    code: "FLASH15",
    discountValue: "15%",
    usageLimit: 200,
    usedCount: 198,
    startDate: "Jun 1, 2024",
    endDate: "Aug 31, 2024",
    isActive: true,
  },
  {
    id: "4",
    code: "WINTER2023",
    discountValue: "30%",
    usageLimit: 300,
    usedCount: 300,
    startDate: "Dec 1, 2023",
    endDate: "Feb 28, 2024",
    isActive: false,
  },
  {
    id: "5",
    code: "WEEKEND20",
    discountValue: "20%",
    usageLimit: 150,
    usedCount: 45,
    startDate: "Jun 1, 2024",
    endDate: "Sep 30, 2024",
    isActive: true,
  },
  {
    id: "6",
    code: "MEGA100",
    discountValue: "$100",
    usageLimit: 50,
    usedCount: 12,
    startDate: "Jul 1, 2024",
    endDate: "Jul 31, 2024",
    isActive: true,
  },
]

export default function VoucherManagement() {
  const [activeMenu, setActiveMenu] = useState("vouchers")
  // State quản lý đóng mở sidebar
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [vouchers, setVouchers] = useState(initialVouchers)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6
  const totalItems = 24

  const handleToggle = (id) => {
    setVouchers((prev) =>
      prev.map((v) => (v.id === id ? { ...v, isActive: !v.isActive } : v))
    )
  }

  const handleEdit = (voucher) => {
    console.log("Edit voucher:", voucher)
  }

  const handleDelete = (id) => {
    setVouchers((prev) => prev.filter((v) => v.id !== id))
  }

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
    // Có thể thêm thông báo (toast) ở đây
  }

  const filteredVouchers = vouchers.filter((v) =>
    v.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Suspense fallback={<Loading />}>
      <div className="flex min-h-screen bg-gray-100"> 
        <Sidebar 
          activeItem={activeMenu} 
          onItemClick={setActiveMenu}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <main className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Mã giảm giá</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Nguyễn Thành Trung</span>
              <Button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white gap-2">
                <Plus className="w-4 h-4" />
                Tạo mã giảm giá
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo mã...."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-gray-200"
              />
            </div>

            <Button
              variant="outline"
              className="bg-white border-gray-200 text-gray-600 gap-2"
            >
              Tất cả trạng thái
              <ChevronDown className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              className="bg-white border-gray-200 text-gray-600 gap-2"
            >
              <Calendar className="w-4 h-4" />
              Ngày bắt đầu - Ngày kết thúc
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="bg-white border-gray-200 text-gray-600"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {/* Table */}
          <VoucherTable
            vouchers={filteredVouchers}
            onToggle={handleToggle}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCopyCode={handleCopyCode}
          />

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={2}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </main>
      </div>
    </Suspense>
  )
}