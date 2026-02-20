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
      <DialogContent 
        // Thêm pointerEvents để tránh vô tình đóng modal khi click ra ngoài
        onPointerDownOutside={(e) => e.preventDefault()}
        className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white p-0"
      >
        <div className="p-6">           
            <CreateDiscountForm
              // Sửa lại đoạn này thành async để đợi kết quả từ Page Cha
              onSubmit={async (data) => {
                try {
                  // Đợi hàm handleCreateSubmit ở page cha chạy xong API
                  await onSubmit?.(data);
                  
                  // Nếu API thành công (success: true), mới chạy xuống dòng này để đóng form
                  onOpenChange(false);
                } catch (error) {
                  // Nếu API trả về lỗi (success: false), nó sẽ nhảy vào đây
                  // Lệnh onOpenChange(false) bị bỏ qua, nên Form sẽ KHÔNG đóng
                  console.error("Lỗi từ API, giữ nguyên form để sửa:", error);
                }
              }}
              onCancel={() => onOpenChange(false)}
            />
        </div>
      </DialogContent>
    </Dialog>
  )
}