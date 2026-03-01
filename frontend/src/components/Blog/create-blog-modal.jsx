"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { CreateBlogForm } from "@/components/Blog/create-blog-form"

export function CreateBlogModal({ isOpen, onOpenChange, onSubmit }) {
  const handleSubmit = (data) => {
    onSubmit(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-white">
        <CreateBlogForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}