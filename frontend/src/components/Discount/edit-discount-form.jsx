import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// 1. Thêm prop readOnly (mặc định false)
export function EditDiscountForm({ initialData, onSubmit, onCancel, readOnly = false }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    maxDiscountValue: 0,
    minPurchaseValue: 0,
    usageLimit: 100,
    startDate: undefined,
    endDate: undefined,
    isActive: true,
  })

  useEffect(() => {
    if (initialData) {
      let type = initialData.discountType;
      if (type === 'percent') type = 'percentage';

      const parseDateIgnoreTime = (dateString) => {
        if (!dateString) return undefined;
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return undefined; 
        const datePart = d.toISOString().split('T')[0]; 
        return new Date(datePart);
      };

      setFormData({
        _id: initialData._id || initialData.id,
        code: initialData.code || '',
        description: initialData.description || '',
        discountType: type,
        discountValue: initialData.value !== undefined ? initialData.value : (initialData.discountValue || 0),
        maxDiscountValue: initialData.maxDiscountValue || 0,
        minPurchaseValue: initialData.minOrderValue || initialData.minPurchaseValue || 0,
        usageLimit: initialData.usageLimit || 0,
        startDate: parseDateIgnoreTime(initialData.validFrom || initialData.startDate),
        endDate: parseDateIgnoreTime(initialData.expiredAt || initialData.endDate),
        isActive: initialData.status === 'active' || initialData.isActive === true,
      })
    }
  }, [initialData])

  const handleInputChange = (field, value) => {
    if (readOnly) return; // Chặn sửa nếu đang xem
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (readOnly) return;
    setIsSubmitting(true)
    await onSubmit(formData)
    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
        <div className="grid gap-6">
            {/* ... Header ... */}
            
            {/* CODE - Luôn disable */}
            <div className="grid gap-2">
                <Label htmlFor="code">Mã giảm giá</Label>
                <Input id="code" value={formData.code} disabled={true} className="bg-gray-100 font-bold text-gray-500" />
            </div>

            {/* DESCRIPTION - Disable theo readOnly */}
            <div className="grid gap-2">
                <Label htmlFor="description">Chi tiết</Label>
                <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    disabled={readOnly} // Thêm disable
                />
            </div>

            {/* BUTTON GROUP - Disable click */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Loại giảm giá</Label>
                    <div className="flex rounded-md shadow-sm">
                        <button
                          type="button"
                          disabled={readOnly} // Disable button
                          onClick={() => handleInputChange('discountType', 'percentage')}
                          className={cn(
                            "flex-1 px-4 py-2 text-sm font-medium border first:rounded-l-md last:rounded-r-md",
                            (formData.discountType === 'percentage' || formData.discountType === 'percent')
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-700 border-gray-300",
                             readOnly && "opacity-70 cursor-not-allowed" // Style mờ đi
                          )}
                        >
                          % Phần trăm
                        </button>
                        <button
                          type="button"
                          disabled={readOnly}
                          onClick={() => handleInputChange('discountType', 'fixed')}
                          className={cn(
                            "flex-1 px-4 py-2 text-sm font-medium border -ml-px first:rounded-l-md last:rounded-r-md",
                            formData.discountType === 'fixed'
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-700 border-gray-300",
                             readOnly && "opacity-70 cursor-not-allowed"
                          )}
                        >
                          $ Số tiền cố định
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Giá trị giảm giá</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500">
                             {(formData.discountType === 'percentage' || formData.discountType === 'percent') ? '%' : 'đ'}
                        </span>
                        <Input
                            type="number"
                            className="pl-8"
                            value={formData.discountValue}
                            onChange={(e) => handleInputChange('discountValue', parseFloat(e.target.value))}
                            disabled={readOnly}
                        />
                    </div>
                </div>
            </div>

            {/* CÁC INPUT SỐ KHÁC */}
            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>Giá trị tối đa được giảm</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500">đ</span>
                        <Input type="number" className="pl-8" value={formData.maxDiscountValue} 
                            onChange={(e) => handleInputChange('maxDiscountValue', parseFloat(e.target.value))}
                            disabled={readOnly} 
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Giá trị đơn tối thiểu</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500">đ</span>
                        <Input type="number" className="pl-8" value={formData.minPurchaseValue}
                            onChange={(e) => handleInputChange('minPurchaseValue', parseFloat(e.target.value))}
                            disabled={readOnly}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                 <Label>Giới hạn sử dụng (Lượt)</Label>
                 <Input type="number" value={formData.usageLimit}
                    onChange={(e) => handleInputChange('usageLimit', parseInt(e.target.value))}
                    disabled={readOnly}
                  />
            </div>

            {/* SWITCH */}
            <div className="flex items-center space-x-2">
    {/* MẸO: Dùng thẻ div bọc ngoài để chặn click chuột (pointer-events-none) 
       khi đang ở chế độ readOnly.
    */}
    <div className={readOnly ? "pointer-events-none" : ""}>
        <Switch
            checked={formData.isActive}
            onCheckedChange={(checked) => handleInputChange('isActive', checked)}       
            disabled={false}         
            className={cn(
                "data-[state=checked]:bg-blue-600",            
                "opacity-100"
            )}
        />
    </div>
    
    <Label className={readOnly ? "text-gray-700" : ""}>
        {formData.isActive ? 'Đang hoạt động' : 'Ngưng hoạt động'}
    </Label>
</div>

            {/* NGÀY THÁNG - Disable Trigger */}
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2">
                    <Label>Ngày bắt đầu</Label>
                    <Popover>
                        <PopoverTrigger asChild disabled={readOnly}>
                            <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !formData.startDate && "text-muted-foreground")}>
                                {formData.startDate ? format(formData.startDate, "dd/MM/yyyy", { locale: vi }) : <span>Chọn ngày</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        {!readOnly && (
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={formData.startDate} onSelect={(date) => handleInputChange('startDate', date)} initialFocus />
                            </PopoverContent>
                        )}
                    </Popover>
                </div>

                <div className="flex flex-col space-y-2">
                    <Label>Ngày kết thúc</Label>
                    <Popover>
                        <PopoverTrigger asChild disabled={readOnly}>
                             <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !formData.endDate && "text-muted-foreground")}>
                                {formData.endDate ? format(formData.endDate, "dd/MM/yyyy", { locale: vi }) : <span>Chọn ngày</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        {!readOnly && (
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={formData.endDate} onSelect={(date) => handleInputChange('endDate', date)} initialFocus />
                            </PopoverContent>
                        )}
                    </Popover>
                </div>
            </div>
        </div>

        {/* ACTIONS BUTTONS */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
            {readOnly ? (
                // Nút Đóng cho View Mode
                <Button variant="secondary" type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300">
                    Đóng
                </Button>
            ) : (
                // Nút Hủy/Lưu cho Edit Mode
                <>
                    <Button variant="outline" type="button" onClick={onCancel} disabled={isSubmitting}>Hủy bỏ</Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Lưu thay đổi
                    </Button>
                </>
            )}
        </div>
    </form>
  )
}