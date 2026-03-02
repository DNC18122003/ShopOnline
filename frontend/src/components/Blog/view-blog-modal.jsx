"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ViewBlogForm } from "@/components/Blog/view-blog-form"

export function ViewBlogModal({ isOpen, onOpenChange, blogId }) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-white">
        {/* Chỉ render Form khi có blogId để tránh lỗi */}
        {blogId && (
          <ViewBlogForm 
            blogId={blogId} 
            onCancel={() => onOpenChange(false)} 
          />
        )}
      </DialogContent>
    </Dialog>
  )
}