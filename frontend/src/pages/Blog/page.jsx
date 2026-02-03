'use client'

import React, { useState, Suspense, useEffect, useMemo } from "react"
import { Search, Plus, RotateCcw } from "lucide-react"

import blogService from "@/services/blog/blog.api" 
import { BlogTable } from "@/components/Blog/blog-table" 
import { Pagination } from "@/components/Discount/pagination"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loading } from "@/components/Discount/loading"
import { DeleteBlogModal } from "@/components/Blog/delete-blog-form" 
import { toast } from "react-toastify" 

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => { clearTimeout(handler); };
  }, [value, delay]);
  return debouncedValue;
}

export default function BlogManagementPage() {
  const [blogPosts, setBlogPosts] = useState([]) // Chứa TOÀN BỘ dữ liệu từ API
  const [isLoading, setIsLoading] = useState(false)
  
  // --- STATE LỌC ---
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 300)

  const [statusFilter, setStatusFilter] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10 
  
  // --- STATE MODAL ---
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [blogToDelete, setBlogToDelete] = useState(null)
  
  // Khi đổi điều kiện lọc -> Về trang 1
  useEffect(() => { 
    setCurrentPage(1) 
  }, [debouncedSearch, statusFilter, startDate, endDate])

  // --- 1. DATA FETCHING (Lấy tất cả về để xử lý ở Client) ---
  const fetchBlogs = async () => {
    setIsLoading(true)
    try {
      // Vì API chưa hỗ trợ filter/paging chuẩn, ta gọi để lấy ALL data
      // (Vẫn có thể truyền params nếu muốn server log lại, nhưng logic chính xử lý ở dưới)
      const res = await blogService.getAllBlogs({}) 
      
      const responseBody = res.data ? res.data : res; 
      const listData = Array.isArray(responseBody) ? responseBody : (responseBody.data || []);
      
      setBlogPosts(listData)
    } catch (error) {
      console.error("Lỗi:", error)
      toast.error("Không thể tải danh sách bài viết")
      setBlogPosts([])
    } finally {
      setIsLoading(false)
    }
  }

  // Chỉ gọi API 1 lần lúc mới vào trang (hoặc khi cần reload data)
  useEffect(() => { 
    fetchBlogs() 
  }, []) 


  // --- 2. LOGIC FILTER & SEARCH (CLIENT SIDE) ---
  // Sử dụng useMemo để tối ưu hiệu năng, chỉ tính toán lại khi các biến phụ thuộc thay đổi
  const filteredData = useMemo(() => {
    return blogPosts.filter((item) => {
      // a. Lọc theo tên (Search)
      const query = debouncedSearch.toLowerCase().trim();
      const title = (item.title || "").toLowerCase();
      const matchesSearch = title.includes(query);

      // b. Lọc theo trạng thái
      // Kiểm tra xem item.status của bạn trả về là 'published'/'draft' hay true/false hay 1/0 để sửa cho khớp
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      
      // c. Lọc theo ngày
      let matchesDate = true
      if (startDate || endDate) {
        const itemTime = new Date(item.createdAt).getTime()
        if (startDate) {
           const start = new Date(startDate); start.setHours(0,0,0,0);
           if (itemTime < start.getTime()) matchesDate = false
        }
        if (endDate && matchesDate) {
           const end = new Date(endDate); end.setHours(23,59,59,999);
           if (itemTime > end.getTime()) matchesDate = false
        }
      }

      return matchesSearch && matchesStatus && matchesDate
    })
  }, [blogPosts, debouncedSearch, statusFilter, startDate, endDate]);


  // --- 3. LOGIC PHÂN TRANG (Dựa trên kết quả đã Filter) ---
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  
  // Cắt dữ liệu để hiển thị
  const paginatedData = filteredData.slice(
      (currentPage - 1) * itemsPerPage, 
      currentPage * itemsPerPage
  );


  // --- LOGIC XÓA ---
  const handleDeleteClick = (id) => {
    const post = blogPosts.find(p => (p._id || p.id) === id)
    if (post) {
        setBlogToDelete(post)
        setDeleteModalOpen(true)
    }
  }

  const handleConfirmDelete = async () => {
    if (!blogToDelete) return
    try {
      const id = blogToDelete._id || blogToDelete.id
      await blogService.deleteBlog(id)
      
      // Cập nhật state gốc
      setBlogPosts(prev => prev.filter(p => (p._id || p.id) !== id))
      
      setDeleteModalOpen(false) 
      setBlogToDelete(null)
      toast.success("Đã xóa bài viết thành công!")
    } catch (error) {
      console.error("Lỗi xóa blog:", error)
      toast.error("Xóa thất bại, vui lòng thử lại!")
    }
  }

  const handleView = (post) => {
    console.log("View post:", post);
    toast.info(`Đang xem chi tiết: ${post.title}`);
  }

  const clearFilters = () => {
      setSearchQuery("")
      setStatusFilter("all")
      setStartDate("")
      setEndDate("")
      setCurrentPage(1)
  }

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || startDate || endDate;

  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen bg-gray-100 relative">
        <main className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">          
            <h1 className="text-2xl font-bold text-gray-900">Danh sách bài đăng</h1>
            <Button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white gap-2 shadow-sm">
                <Plus className="w-4 h-4" /> Tạo Bài Đăng
            </Button>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
                <div className="relative flex-1 w-full md:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                    placeholder="Tìm tiêu đề..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="pl-10 border-gray-200" 
                    />
                </div>
                <div className="w-full md:w-auto min-w-[150px]">
                    <select
                        className="w-full h-10 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="published">Đã xuất bản</option>
                        <option value="draft">Nháp</option>
                        <option value="archived">Lưu trữ</option>
                    </select>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            <span className="text-[10px] bg-white px-1">Từ</span>
                        </span>
                        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full md:w-[140px] pl-8 text-sm" />
                    </div>
                    <div className="relative">
                         <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            <span className="text-[10px] bg-white px-1">Đến</span>
                        </span>
                        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full md:w-[140px] pl-8 text-sm" />
                    </div>
                </div>
                {hasActiveFilters && (
                    <Button variant="ghost" onClick={clearFilters} className="text-red-500 hover:text-red-700 hover:bg-red-50 gap-2 px-3">
                        <RotateCcw className="w-4 h-4" /> Xóa lọc
                    </Button>
                )}
              </div>
          </div>

          {/* Table Content */}
          <div className="space-y-4">
            {isLoading ? (
                <div className="w-full h-40 flex items-center justify-center bg-white rounded border">
                    <Loading /> <span className="ml-2 text-gray-500">Đang tải dữ liệu...</span>
                </div>
            ) : (
                <BlogTable
                    // SỬ DỤNG DỮ LIỆU ĐÃ LỌC VÀ CẮT TRANG
                    posts={paginatedData} 
                    onEdit={(post) => console.log("Edit:", post)}
                    onDelete={handleDeleteClick}
                    onView={handleView} 
                />
            )}
            
            {!isLoading && totalItems > 0 && (
                 <Pagination
                   currentPage={currentPage}
                   totalPages={totalPages}
                   totalItems={totalItems} // Tổng số item sau khi lọc
                   itemsPerPage={itemsPerPage}
                   onPageChange={setCurrentPage}
                 />
            )}
            
            {!isLoading && totalItems === 0 && (
                <div className="text-center py-10 text-gray-500 bg-white rounded">
                    Không tìm thấy bài viết nào phù hợp.
                </div>
            )}
          </div>
        </main>

        <DeleteBlogModal 
            isOpen={deleteModalOpen}
            onOpenChange={setDeleteModalOpen}
            blogTitle={blogToDelete?.title || ""}
            onConfirm={handleConfirmDelete}
        />
      </div>
    </Suspense>
  )
}