'use client'

import React, { useState } from "react"
import { Upload, Loader2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function CreateBlogForm({ onSubmit, onCancel }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "", // Sẽ map thành 'content'
    author: "",
    status: "published",
    thumbnail: "",
  })

  const [thumbnailPreview, setThumbnailPreview] = useState("")

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { alert("Ảnh phải nhỏ hơn 5MB"); return; }
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnailPreview(reader.result)
        handleInputChange("thumbnail", reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate các trường cần thiết theo hình ảnh Schema
    if (!formData.title.trim()) return alert("Vui lòng nhập tiêu đề");
    if (!formData.excerpt.trim()) return alert("Vui lòng nhập nội dung chi tiết");
    if (!formData.author.trim()) return alert("Vui lòng nhập tên người tạo");

    setIsLoading(true)
    try {
      // Payload đã lược bỏ slug theo yêu cầu
      const payload = {
        title: formData.title,
        content: formData.excerpt, // Map excerpt -> content cho khớp DB
        author: formData.author,
        thumbnail: formData.thumbnail || "https://example.com/default.jpg",
        status: formData.status, // 'published' hoặc 'draft'
      }

      if (onSubmit) {
        await onSubmit(payload);
      }
    } catch (error) {
      // Lỗi do Component cha (page.jsx) xử lý hiển thị toast
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4">
        {/* Ảnh đại diện */}
        <div className="flex flex-col gap-3">
          <Label className="font-bold">Ảnh bài viết</Label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center relative bg-gray-50 overflow-hidden">
              {thumbnailPreview ? (
                <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : <Upload className="text-gray-400 w-8 h-8" />}
            </div>
            <div className="flex-1">
              <Input type="file" accept="image/*" onChange={handleThumbnailChange} className="cursor-pointer" />
              <p className="text-[10px] text-gray-500 mt-1">PNG, JPG tối đa 5MB</p>
            </div>
          </div>
        </div>

        {/* Tiêu đề */}
        <div className="space-y-2">
          <Label className="font-bold">Tiêu đề bài viết</Label>
          <Input 
            value={formData.title} 
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="Nhập tiêu đề..." 
          />
        </div>

        {/* Nội dung chi tiết */}
        <div className="space-y-2">
          <Label className="font-bold">Nội dung bài viết</Label>
          <Textarea 
            value={formData.excerpt} 
            onChange={(e) => handleInputChange("excerpt", e.target.value)}
            className="min-h-[150px]"
            placeholder="Nhập nội dung chi tiết..."
          />
        </div>

        {/* Người tạo và Trạng thái */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="font-bold">Người tạo</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                className="pl-9"
                value={formData.author} 
                onChange={(e) => handleInputChange("author", e.target.value)}
                placeholder="Tên tác giả..." 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="font-bold">Trạng thái</Label>
            <div className="flex h-10 items-center gap-6 px-3 border rounded-md bg-white">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  checked={formData.status === "published"} 
                  onChange={() => handleInputChange("status", "published")} 
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm">Công khai</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  checked={formData.status === "draft"} 
                  onChange={() => handleInputChange("status", "draft")} 
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm">Bản nháp</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Hủy</Button>
        <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tạo...</>
          ) : "Tạo bài viết"}
        </Button>
      </div>
    </form>
  )
}