import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CreateDiscountForm } from './create-discount-form'

export function CreateDiscountModal({
  isOpen,
  onOpenChange,
  onSubmit,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {/* THAY ĐỔI QUAN TRỌNG:
         - Sửa 'max-w-2xl' thành 'max-w-4xl' (để rộng gấp đôi) 
         - Hoặc 'max-w-5xl' nếu muốn to hơn nữa
      */}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white p-0">
        <div className="p-6">           
            <CreateDiscountForm
              onSubmit={(data) => {
                onSubmit?.(data)
                onOpenChange(false)
              }}
              onCancel={() => onOpenChange(false)}
            />
        </div>
      </DialogContent>
    </Dialog>
  )
}