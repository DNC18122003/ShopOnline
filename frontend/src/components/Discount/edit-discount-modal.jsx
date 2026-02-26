import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EditDiscountForm } from './edit-discount-form' // Import file form bạn đã tạo trước đó

export function EditDiscountModal({ isOpen, onOpenChange, voucherData, onSubmit }) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Form chỉnh sửa */}
        {voucherData && (
            <EditDiscountForm 
                initialData={voucherData}
                onSubmit={onSubmit}
                onCancel={() => onOpenChange(false)}
            />
        )}
      </DialogContent>
    </Dialog>
  )
}