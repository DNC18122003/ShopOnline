'use client'

import React, { useState, Suspense, useEffect, useMemo } from "react"
import { Search, Plus, RotateCcw } from "lucide-react"

import blogService from "@/services/blog/blog.api" 
import { BlogTable } from "@/components/Blog/blog-table" 
import { Pagination } from "@/components/Discount/pagination"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DeleteBlogModal } from "@/components/Blog/delete-blog-form" 
import { CreateBlogModal } from "@/components/Blog/create-blog-modal" 
import { toast } from "react-toastify" 

// --- 1. THÊM LẠI HÀM DEBOUNCE ĐỂ SỬA LỖI MÀN HÌNH TRẮNG ---
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => { clearTimeout(handler); };
  }, [value, delay]);
  return debouncedValue;
}

export default function BlogManagementPage() {
  const [blogPosts, setBlogPosts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  
  // --- STATE MODALS ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [blogToDelete, setBlogToDelete] = useState(null)
  
  // --- STATE LỌC ---
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 300)
  const [statusFilter, setStatusFilter] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10 

  useEffect(() => { 
    setCurrentPage(1) 
  }, [debouncedSearch, statusFilter, startDate, endDate])

  const fetchBlogs = async () => {
    setIsLoading(true)
    try {
      const res = await blogService.getAllBlogs({}) 
      // Xử lý linh hoạt các dạng response từ API
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

  useEffect(() => { 
    fetchBlogs() 
  }, []) 

  // --- 2. XỬ LÝ TẠO MỚI (CHỈ GỌI SERVICE) ---
  const handleCreateBlog = async (payload) => {
    try {
      setIsLoading(true)
      // Service sẽ tự động gọi qua Proxy (ví dụ localhost:5000/api/blogs)
      const res = await blogService.createBlog(payload) 
      
      if (res) {
        toast.success("Đã tạo bài viết mới thành công!")
        setIsCreateModalOpen(false) 
        fetchBlogs() // Refresh danh sách
      }
    } catch (error) {
      console.error("Lỗi tạo blog:", error)
      const errorMsg = error.response?.data?.message || "Không thể tạo bài viết. Vui lòng thử lại!"
      toast.error(errorMsg)
      // Throw error để Form bên trong (CreateBlogForm) biết để dừng loading nút submit
      throw error 
    } finally {
      setIsLoading(false)
    }
  }

  // --- 3. XỬ LÝ XÓA ---
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
      setBlogPosts(prev => prev.filter(p => (p._id || p.id) !== id))
      setDeleteModalOpen(false) 
      setBlogToDelete(null)
      toast.success("Đã xóa bài viết thành công!")
    } catch (error) {
      toast.error("Xóa thất bại!")
    }
  }

  // --- 4. LOGIC LỌC DỮ LIỆU ---
  const filteredData = useMemo(() => {
    return blogPosts.filter((item) => {
      const query = debouncedSearch.toLowerCase().trim();
      const title = (item.title || "").toLowerCase();
      const matchesSearch = title.includes(query);
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      
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

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedData = filteredData.slice(
      (currentPage - 1) * itemsPerPage, 
      currentPage * itemsPerPage
  );

  const clearFilters = () => {
      setSearchQuery("")
      setStatusFilter("all")
      setStartDate("")
      setEndDate("")
      setCurrentPage(1)
  }

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || startDate || endDate;

  return (
    <Suspense fallback={<div>Đang tải trang...</div>}>
      <div className="min-h-screen bg-gray-100 relative">
        <main className="p-8">
          <div className="flex items-center justify-between mb-6">          
            <h1 className="text-2xl font-bold text-gray-900">Danh sách bài đăng</h1>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#3B82F6] hover:bg-[#2563EB] text-white gap-2 shadow-sm"
            >
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
                        <option value="published">Công khai</option>
                        <option value="draft">Nháp</option>
                    </select>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full md:w-[140px] text-sm" />
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full md:w-[140px] text-sm" />
                </div>
                {hasActiveFilters && (
                    <Button variant="ghost" onClick={clearFilters} className="text-red-500 hover:text-red-700 hover:bg-red-50 gap-2 px-3">
                        <RotateCcw className="w-4 h-4" /> Xóa lọc
                    </Button>
                )}
              </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
                <div className="w-full h-40 flex items-center justify-center bg-white rounded border">
                    <RotateCcw className="w-5 h-5 animate-spin text-blue-500" />
                    <span className="ml-2 text-gray-500">Đang tải dữ liệu...</span>
                </div>
            ) : (
                <BlogTable
                    posts={paginatedData} 
                    onEdit={(post) => console.log("Edit:", post)}
                    onDelete={handleDeleteClick}
                    onView={(post) => toast.info(`Đang xem: ${post.title}`)} 
                />
            )}
            
            {!isLoading && totalItems > 0 && (
                 <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                 />
            )}
          </div>
        </main>

        <CreateBlogModal 
          isOpen={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSubmit={handleCreateBlog} 
        />

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