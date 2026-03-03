'use client'

import React, { useState, useEffect } from "react"
import { Upload, Loader2, User, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function CreateBlogForm({ onSubmit, onCancel, currentUser }) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "", 
    author: currentUser || "", 
    status: "published",
    thumbnail: "",
  })

  const [thumbnailPreview, setThumbnailPreview] = useState("")

  // Đồng bộ author khi currentUser từ layout truyền xuống
  useEffect(() => {
    if (currentUser && !formData.author) {
      setFormData(prev => ({ ...prev, author: currentUser }));
    }
  }, [currentUser]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errorText) setErrorText("");
  }

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      setErrorText("Lỗi: Định dạng ảnh phải là PNG hoặc JPG.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorText("Lỗi: Kích thước ảnh không được vượt quá 5MB.");
      return;
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setThumbnailPreview(reader.result)
      handleInputChange("thumbnail", reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate
    if (!formData.title.trim() || !formData.excerpt.trim() || !formData.author.trim() || !formData.thumbnail) {
      setErrorText("Lỗi: Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }

    if (formData.title.length > 50) {
      setErrorText("Lỗi: Tiêu đề bài viết không được vượt quá 50 ký tự.");
      return;
    }

    if (formData.excerpt.length > 500) {
      setErrorText("Lỗi: Nội dung bài viết không được vượt quá 500 ký tự.");
      return;
    }

    setIsLoading(true)
    try {
      const payload = {
        title: formData.title.trim(),
        content: formData.excerpt.trim(), 
        author: formData.author.trim(),
        thumbnail: formData.thumbnail,
        status: formData.status,
      }
      if (onSubmit) await onSubmit(payload);
    } catch (error) {
      setErrorText(`Lỗi: ${error.message}`);
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorText && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
          <p className="text-sm text-red-600 leading-tight">
            <span className="font-bold">Lỗi:</span> {errorText.replace("Lỗi: ", "")}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {/* Ảnh bài viết */}
        <div className="flex flex-col gap-3">
          <Label className="font-bold text-sm">Ảnh bài viết <span className="text-red-500">*</span></Label>
          <div className="flex items-center gap-4">
            <div className={`w-20 h-20 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden ${errorText && !formData.thumbnail ? 'border-red-400' : ''}`}>
              {thumbnailPreview ? (
                <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : <Upload className="text-gray-400 w-6 h-6" />}
            </div>
            <div className="flex-1">
              <Input type="file" accept=".jpg,.jpeg,.png" onChange={handleThumbnailChange} className="cursor-pointer h-9 text-sm" />
              <p className="text-[10px] text-gray-500 mt-1 italic">PNG, JPG tối đa 5MB</p>
            </div>
          </div>
        </div>

        {/* Tiêu đề */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="font-bold text-sm">Tiêu đề bài viết <span className="text-red-500">*</span></Label>
            <span className={`text-[10px] ${formData.title.length > 50 ? 'text-red-500' : 'text-gray-400'}`}>
                {formData.title.length}/50
            </span>
          </div>
          <Input 
            value={formData.title} 
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="Nhập tiêu đề..."
            className={errorText && !formData.title ? "border-red-400 focus-visible:ring-red-400" : ""}
          />
        </div>

        {/* Nội dung */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="font-bold text-sm">Nội dung bài viết <span className="text-red-500">*</span></Label>
            <span className={`text-[10px] ${formData.excerpt.length > 500 ? 'text-red-500' : 'text-gray-400'}`}>
                {formData.excerpt.length}/500
            </span>
          </div>
          <Textarea 
            value={formData.excerpt} 
            onChange={(e) => handleInputChange("excerpt", e.target.value)}
            className={`min-h-[100px] ${errorText && !formData.excerpt ? "border-red-400 focus-visible:ring-red-400" : ""}`}
            placeholder="Mô tả nội dung bài viết..."
          />
        </div>

        {/* Người tạo & Trạng thái */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="font-bold text-sm">Người tạo <span className="text-red-500">*</span></Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                className={`pl-9 bg-gray-50 cursor-not-allowed ${errorText && !formData.author ? "border-red-400" : ""}`} 
                value={formData.author} 
                readOnly 
                placeholder="Tên tác giả..." 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-bold text-sm">Trạng thái</Label>
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
                  onChange={() => handleInputChange("status", "draft")} // Đã sửa ở đây
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm">Bản nháp</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Hủy bỏ</Button>
        <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tạo bài viết"}
        </Button>
      </div>
    </form>
  )
}