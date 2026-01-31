import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'

export function DeleteBlogModal({
  isOpen,
  onOpenChange,
  blogTitle = '', // Đổi từ discountCode sang blogTitle
  onConfirm,
}) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Icon */}
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-500" />
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-900">Xóa bài viết</h2>

          {/* Description */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Bạn có chắc chắn muốn xóa bài viết{' '}
              <span className="font-semibold text-gray-900">"{blogTitle}"</span> không?
            </p>
            <p className="text-sm text-gray-500">
              Hành động này không thể hoàn tác và bài viết sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 w-full pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            >
              Xóa
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}