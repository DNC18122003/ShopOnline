"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EditBlogForm } from "@/components/Blog/edit-blog-form"

export function EditBlogModal({ isOpen, onOpenChange, blogId, onSubmit }) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-white">
        <DialogHeader>
            <DialogTitle className="text-xl font-bold border-b pb-3">
                Chỉnh sửa bài viết
            </DialogTitle>
        </DialogHeader>
        
        {/* Chỉ render Form khi có blogId */}
        {blogId && (
          <EditBlogForm 
            blogId={blogId} 
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)} 
          />
        )}
      </DialogContent>
    </Dialog>
  )
}