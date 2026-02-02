'use client'

import React, { useState, Suspense, useEffect } from "react"
// Import icon Check (cho thông báo thành công) và X (để đóng)
import { Search, ChevronDown, Plus, X, CheckCircle2 } from "lucide-react"

import blogService from "@/services/blog/blog.api" 
import { BlogTable } from "@/components/Blog/blog-table" 
import { Pagination } from "@/components/Discount/pagination"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loading } from "@/components/Discount/loading"
import { DeleteBlogModal } from "@/components/Blog/delete-blog-form" 

export default function BlogManagementPage() {
  const [blogPosts, setBlogPosts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  
  // --- STATE LỌC ---
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10 

  // --- STATE MODAL & TOAST ---
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [blogToDelete, setBlogToDelete] = useState(null)
  
  // State hiển thị thông báo (Toast)
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  // Reset trang về 1 khi lọc
  useEffect(() => { setCurrentPage(1) }, [searchQuery, statusFilter, startDate, endDate])

  // --- DATA FETCHING ---
  const fetchBlogs = async () => {
    setIsLoading(true)
    try {
      const res = await blogService.getAllBlogs()
      const responseBody = res.data ? res.data : res; 
      const listData = Array.isArray(responseBody) ? responseBody : responseBody.data;
      setBlogPosts(Array.isArray(listData) ? listData : [])
    } catch (error) {
      console.error("Lỗi:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchBlogs() }, [])

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
      
      // Cập nhật danh sách
      setBlogPosts((prev) => prev.filter((p) => (p._id || p.id) !== id))
      
      // Đóng modal và reset
      setBlogToDelete(null)

      // --- HIỆN THÔNG BÁO THÀNH CÔNG ---
      setShowSuccessToast(true)
      
      // Tự động tắt sau 3 giây
      setTimeout(() => {
        setShowSuccessToast(false)
      }, 3000)

    } catch (error) {
      console.error("Lỗi xóa blog:", error)
      alert("Xóa thất bại, vui lòng thử lại!")
    }
  }

  // --- LOGIC LỌC (Giữ nguyên) ---
  const filteredData = blogPosts.filter((item) => {
    const query = searchQuery.toLowerCase()
    const matchesSearch = (item.title?.toLowerCase() || "").includes(query)
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    
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
  
  // Pagination logic...
  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen bg-gray-100 relative">
        
        {/* --- TOAST MESSAGE --- */}
        {/* Phần này hiển thị thông báo giống hệt hình bạn gửi */}
        {showSuccessToast && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-5 fade-in duration-300">
            <div className="flex items-center gap-3 bg-white px-4 py-3 rounded shadow-md border-l-4 border-green-500 min-w-[300px]">
               {/* Icon Check xanh */}
               <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-50" />
               
               <div className="flex-1 text-sm font-medium text-gray-700">
                  Đã xóa bài viết thành công
               </div>

               {/* Nút đóng */}
               <button 
                 onClick={() => setShowSuccessToast(false)}
                 className="text-gray-400 hover:text-gray-600 transition-colors"
               >
                 <X className="w-4 h-4" />
               </button>
            </div>
          </div>
        )}

        <main className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">          
            <h1 className="text-2xl font-bold text-gray-900">Danh sách bài đăng</h1>
            <Button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white gap-2 shadow-sm">
                <Plus className="w-4 h-4" /> Tạo Bài Đăng
            </Button>
          </div>

          {/* Filter Bar (Giữ nguyên code cũ của bạn) */}
          <div className="flex flex-col xl:flex-row gap-4 mb-6">
             {/* ... Code phần filter ... */}
             <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                   placeholder="Tìm kiếm bài viết..." 
                   value={searchQuery} 
                   onChange={(e) => setSearchQuery(e.target.value)} 
                   className="pl-10 bg-white border-gray-200" 
                />
             </div>
             {/* ... Các bộ lọc khác ... */}
          </div>

          {/* Table Content */}
          <div className="space-y-4">
            {isLoading ? (
                <div className="w-full h-40 flex items-center justify-center bg-white rounded border">
                    <Loading /> <span className="ml-2 text-gray-500">Đang tải dữ liệu...</span>
                </div>
            ) : (
                <BlogTable
                    posts={paginatedData}
                    onEdit={(post) => console.log(post)}
                    onDelete={handleDeleteClick} 
                />
            )}
            
            {/* Pagination */}
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

        {/* Modal Xóa */}
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