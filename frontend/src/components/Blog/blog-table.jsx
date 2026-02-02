'use client'

import React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Edit, Trash2, FileText, CheckCircle, Clock, Eye, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const formatDate = (dateString) => {
  if (!dateString) return "---";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "---";
    return date.toLocaleDateString("vi-VN");
  } catch (e) {
    return "Error";
  }
}

export function BlogTable({ posts = [], onEdit, onDelete }) {
  return (
    <div className="rounded-md border bg-white shadow-sm">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            {/* Cột 1: Ảnh - Tăng width lên 80px cho thoải mái */}
            <TableHead className="w-[80px] text-center">Ảnh</TableHead>
            
            {/* Cột 2: Tiêu đề */}
            <TableHead className="text-left w-[320px]">Tiêu đề bài viết</TableHead>
            
            {/* Cột 3: Người tạo */}
            <TableHead className="text-center w-[150px]">Người tạo</TableHead>
            
            {/* Cột 4: Ngày đăng */}
            <TableHead className="text-center w-[120px]">Ngày đăng</TableHead>

             {/* Cột 5: Lượt xem */}
             <TableHead className="text-center w-[100px]">Lượt xem</TableHead>
            
            {/* Cột 6: Trạng thái */}
            <TableHead className="text-center w-[150px]">Trạng thái</TableHead>
            
            {/* Cột 7: Hành động */}
            <TableHead className="text-right w-[100px] pr-6">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                Không có bài viết nào.
              </TableCell>
            </TableRow>
          ) : (
            posts.map((post) => (
              <TableRow key={post._id || post.id} className="hover:bg-gray-50 transition-colors">
                
                {/* 1. SỬA: Hiển thị Thumbnail */}
                <TableCell className="text-center p-2">
                   <div className="flex justify-center items-center">
                     {post.thumbnail ? (
                        // Nếu có ảnh -> Hiển thị ảnh
                        <div className="w-10 h-10 rounded-md overflow-hidden border border-gray-200">
                          <img 
                            src={post.thumbnail} 
                            alt="thumb" 
                            className="w-full h-full object-cover"
                            // Xử lý nếu ảnh lỗi thì ẩn đi hoặc hiện placeholder (tùy chọn)
                            onError={(e) => {
                              e.target.onerror = null; 
                              e.target.src = "https://placehold.co/40x40?text=No+Img";
                            }}
                          />
                        </div>
                     ) : (
                        // Nếu không có ảnh -> Hiện icon mặc định
                        <div className="w-10 h-10 flex items-center justify-center bg-blue-50 rounded-md text-blue-600">
                           <ImageIcon size={20} />
                        </div>
                     )}
                   </div>
                </TableCell>

                <TableCell className="text-left">
                  <div className="font-semibold text-gray-900 line-clamp-2">
                    {post.title || "Không có tiêu đề"}
                  </div>
                </TableCell>

                <TableCell className="text-center font-medium text-gray-700">
                  {post.authorName || (post.authorId ? "User " + post.authorId : "Admin")}
                </TableCell>

                <TableCell className="text-center text-gray-600">
                  {formatDate(post.createdAt)}
                </TableCell>

                 <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1 text-gray-600 font-medium">
                        <Eye size={14} className="text-gray-400" />
                        <span>{(post.viewCount || 0).toLocaleString('vi-VN')}</span>
                    </div>
                </TableCell>

                <TableCell className="text-center">
                  <div className="flex justify-center">
                    {post.status === 'published' ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-200 shadow-none border-green-200 whitespace-nowrap">
                          <CheckCircle className="w-3 h-3 mr-1" /> Công khai
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 shadow-none border-yellow-200 whitespace-nowrap">
                          <Clock className="w-3 h-3 mr-1" /> Bản nháp
                      </Badge>
                    )}
                  </div>
                </TableCell>

                <TableCell className="text-right pr-4">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(post)} className="text-gray-500 hover:text-orange-600 h-8 w-8">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(post._id || post.id)} className="text-gray-500 hover:text-red-600 hover:bg-red-50 h-8 w-8">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}