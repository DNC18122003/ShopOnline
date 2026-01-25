'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
// Đã xóa "type DiscountFormData"
import { CreateDiscountForm } from './create-discount-form'

export function CreateDiscountModal({
  isOpen,
  onOpenChange,
  onSubmit,
}) {
  const handleSubmit = (data) => {
    console.log('Creating discount:', data)
    // Dấu ?. giúp tránh lỗi nếu không truyền hàm onSubmit
    onSubmit?.(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {/* Lưu ý: DialogContent của Shadcn thường cần có DialogTitle bên trong để đảm bảo Accessibility, 
          nhưng mình giữ nguyên logic như code gốc của bạn */}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-white">
        <CreateDiscountForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}