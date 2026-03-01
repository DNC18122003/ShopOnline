import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ViewDiscountForm } from './view-discount-form'

export function ViewDiscountModal({ isOpen, onOpenChange, voucherData }) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết mã giảm giá</DialogTitle>
        </DialogHeader>
        
        {/* Truyền prop readOnly={true} để khóa form */}
        <ViewDiscountForm 
            initialData={voucherData} 
            readOnly={true} 
            onCancel={() => onOpenChange(false)} 
        />
      </DialogContent>
    </Dialog>
  )
}