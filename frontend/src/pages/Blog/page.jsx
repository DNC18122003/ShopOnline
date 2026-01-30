import { useState, Suspense } from "react"
import { Search, ChevronDown, Calendar, Filter, Plus } from "lucide-react"

// Đảm bảo đường dẫn import đúng với cấu trúc dự án của bạn
import { Sidebar } from "@/components/Discount/sidebar"
import { VoucherTable } from "@/components/Discount/voucher-table"
import { BlogTable } from "@/components/layouts/Blog/blog-table" 
import { Pagination } from "@/components/Discount/pagination"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loading } from "@/components/Discount/loading"

const initialBlogPosts = [
  {
    id: "1",
    title: "Advanced Web Design Techniques",
    author: "Nguyễn Thành Trung",
    publishDate: "15/11/2024",
    status: "public",
  },
  {
    id: "2",
    title: "JavaScript Best Practices 2024",
    author: "Nguyễn Thành Trung",
    publishDate: "15/11/2024",
    status: "public",
  },
  {
    id: "3",
    title: "Digital Marketing Trends",
    author: "Nguyễn Thành Trung",
    publishDate: "15/11/2024",
    status: "draft",
  },
  {
    id: "4",
    title: "UX Design Principles",
    author: "Nguyễn Thành Trung",
    publishDate: "15/11/2024",
    status: "public",
  },
  {
    id: "5",
    title: "React Performance Optimization",
    author: "Nguyễn Thành Trung",
    publishDate: "14/11/2024",
    status: "public",
  },
  {
    id: "6",
    title: "CSS Grid and Flexbox Guide",
    author: "Nguyễn Thành Trung",
    publishDate: "14/11/2024",
    status: "draft",
  },
]

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
  const [activeMenu, setActiveMenu] = useState("posts")
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [vouchers, setVouchers] = useState(initialVouchers)
  const [blogPosts, setBlogPosts] = useState(initialBlogPosts)
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
  }

  const handleViewBlog = (post) => {
    console.log("View blog:", post)
  }

  const handleEditBlog = (post) => {
    console.log("Edit blog:", post)
  }

  const handleDeleteBlog = (id) => {
    setBlogPosts((prev) => prev.filter((p) => p.id !== id))
  }

  const filteredVouchers = vouchers.filter((v) =>
    v.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredBlogPosts = blogPosts.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.author.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Suspense fallback={<Loading />}>
      <div className="flex min-h-screen bg-[#E8F4FC]">
        <Sidebar 
          activeItem={activeMenu} 
          onItemClick={setActiveMenu}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <main className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              {activeMenu === "posts" ? "Quản lý bài đăng" : "Mã giảm giá"}
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Nguyễn Thành Trung</span>
              <Button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white gap-2">
                <Plus className="w-4 h-4" />
                {activeMenu === "posts" ? "Tạo Bài Đăng" : "Tạo mã giảm giá"}
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={
                  activeMenu === "posts"
                    ? "Tìm kiếm bài đăng theo tên, người tạo"
                    : "Tìm kiếm theo mã...."
                }
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

            {activeMenu === "vouchers" && (
              <Button
                variant="outline"
                className="bg-white border-gray-200 text-gray-600 gap-2"
              >
                <Calendar className="w-4 h-4" />
                Ngày bắt đầu - Ngày kết thúc
              </Button>
            )}

            {activeMenu === "posts" && (
              <div className="text-sm text-gray-600">
                {filteredBlogPosts.length} bài đăng
              </div>
            )}

            <Button
              variant="outline"
              size="icon"
              className="bg-white border-gray-200 text-gray-600"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {/* Table */}
          {activeMenu === "posts" ? (
            <BlogTable
              posts={filteredBlogPosts}
              onView={handleViewBlog}
              onEdit={handleEditBlog}
              onDelete={handleDeleteBlog}
            />
          ) : (
            <VoucherTable
              vouchers={filteredVouchers}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCopyCode={handleCopyCode}
            />
          )}

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