"use client"

import React, { useState, useEffect } from "react"
import { Loader2, User, Calendar, Eye, Image as ImageIcon } from "lucide-react" 
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function EditBlogForm({ blogId, onSubmit, onCancel }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    thumbnail: "", 
    status: "published",
    author: "",
    createdAt: "",
    viewCount: 0
  })

  useEffect(() => {
    if (!blogId) return;
    
    const fetchBlogDetail = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:9999/api/blogs/${blogId}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          setFormData({
            title: result.data.title || "",
            content: result.data.content || "",
            thumbnail: result.data.thumbnail || "",
            status: result.data.status || "published",
            author: result.data.author || "Không xác định",
            createdAt: result.data.createdAt || "",
            viewCount: result.data.viewCount || 0
          });
        }
      } catch (error) {
        console.error("Lỗi khi fetch chi tiết bài viết:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogDetail();
  }, [blogId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ---> THÊM HÀM XỬ LÝ KHI CHỌN ẢNH MỚI <---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Đọc file ảnh và chuyển sang dạng Base64 để preview và gửi lên server
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, thumbnail: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updatePayload = {
        title: formData.title,
        content: formData.content,
        thumbnail: formData.thumbnail,
        status: formData.status
      }
      await onSubmit(blogId, updatePayload);
    } catch (error) {
      console.error("Lỗi submit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Chưa cập nhật";
    const date = new Date(dateString);
    const time = date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const day = date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    return `${time} ${day}`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
        <p className="text-gray-500">Đang tải dữ liệu cũ...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ---> THAY ĐỔI GIAO DIỆN PHẦN ẢNH BÀI VIẾT TẠI ĐÂY <--- */}
      <div className="space-y-2">
        <Label className="font-bold">Ảnh bài viết</Label>
        <div className="flex items-center gap-4">
          {/* Khung Preview Ảnh */}
          <div className="w-24 h-24 border rounded-md overflow-hidden bg-gray-50 flex items-center justify-center flex-shrink-0">
            {formData.thumbnail ? (
              <img src={formData.thumbnail} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-8 h-8 text-gray-300" />
            )}
          </div>
          
          {/* Nút Chọn File */}
          <div className="flex-1">
            <Input 
              type="file" 
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleImageChange}
              className="cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-2">PNG, JPG tối đa 5MB</p>
          </div>
        </div>
      </div>

      {/* Tiêu đề */}
      <div className="space-y-2">
        <Label className="font-bold">Tiêu đề bài viết</Label>
        <Input 
          name="title"
          value={formData.title} 
          onChange={handleChange}
          placeholder="Nhập tiêu đề..."
          required
        />
      </div>

      {/* Nội dung */}
      <div className="space-y-2">
        <Label className="font-bold">Nội dung bài viết</Label>
        <Textarea 
          name="content"
          value={formData.content} 
          onChange={handleChange}
          className="min-h-[150px]" 
          placeholder="Viết nội dung tại đây..."
          required
        />
      </div>

      {/* Khung thông tin phụ (Read-only) + Trạng thái */}
      <div className="bg-slate-50 p-4 rounded-xl border grid grid-cols-2 gap-4 text-sm mt-2">
        <div>
          <p className="flex items-center gap-2 text-gray-500 mb-1">
            <User className="w-4 h-4" /> Người tạo
          </p>
          <p className="font-medium text-gray-900">{formData.author}</p>
        </div>

        <div>
          <p className="flex items-center gap-2 text-gray-500 mb-1">
            <Calendar className="w-4 h-4" /> Ngày đăng
          </p>
          <p className="font-medium text-gray-900">{formatDateTime(formData.createdAt)}</p>
        </div>

        <div>
          <p className="flex items-center gap-2 text-gray-500 mb-1">
            <Eye className="w-4 h-4" /> Lượt xem
          </p>
          <p className="font-medium text-blue-600">{formData.viewCount} lượt</p>
        </div>

        <div>
          <p className="flex items-center gap-2 text-gray-500 mb-2 font-bold">Trạng thái</p>
          <div className="flex gap-4 items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="status" 
                value="published" 
                checked={formData.status === "published"}
                onChange={handleChange}
                className="accent-blue-600"
              /> 
              <span>Công khai</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="status" 
                value="draft" 
                checked={formData.status === "draft"}
                onChange={handleChange}
                className="accent-blue-600"
              /> 
              <span>Bản nháp</span>
            </label>
          </div>
        </div>
      </div>

      {/* Nút hành động */}
      <div className="flex justify-end gap-3 pt-4 border-t mt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Hủy
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Cập nhật
        </Button>
      </div>
    </form>
  )
}