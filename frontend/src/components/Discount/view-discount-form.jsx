import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"

export function ViewDiscountForm({ initialData, onCancel }) {
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

  // Parse dữ liệu ban đầu
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

  return (
    <div className="w-full space-y-6">
        <div className="grid gap-6">
            
            {/* CODE */}
            <div className="grid gap-2">
                <Label>Mã giảm giá</Label>
                <Input value={formData.code} disabled={true} className="bg-gray-100 font-bold text-gray-500" />
            </div>

            {/* DESCRIPTION */}
            <div className="grid gap-2">
                <Label>Chi tiết</Label>
                <Textarea
                    value={formData.description}
                    disabled={true}
                    className="bg-gray-50 text-gray-500"
                />
            </div>

            {/* TYPE & VALUE */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Loại giảm giá</Label>
                    <div className="flex rounded-md shadow-sm opacity-70 pointer-events-none">
                        <button
                          type="button"
                          disabled={true}
                          className={cn(
                            "flex-1 px-4 py-2 text-sm font-medium border first:rounded-l-md last:rounded-r-md cursor-not-allowed",
                            (formData.discountType === 'percentage' || formData.discountType === 'percent')
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-gray-100 text-gray-500 border-gray-300"
                          )}
                        >
                          % Phần trăm
                        </button>
                        <button
                          type="button"
                          disabled={true}
                          className={cn(
                            "flex-1 px-4 py-2 text-sm font-medium border -ml-px first:rounded-l-md last:rounded-r-md cursor-not-allowed",
                            formData.discountType === 'fixed'
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-gray-100 text-gray-500 border-gray-300"
                          )}
                        >
                          $ Số tiền cố định
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Giá trị giảm giá</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-400">
                              {(formData.discountType === 'percentage' || formData.discountType === 'percent') ? '%' : 'đ'}
                        </span>
                        <Input
                            type="text"
                            className="pl-8 bg-gray-50 text-gray-500"
                            value={formData.discountValue.toLocaleString()}
                            disabled={true}
                        />
                    </div>
                </div>
            </div>

            {/* MIN & MAX VALUE */}
            <div className={cn(
                "grid gap-4",
                (formData.discountType === 'percentage' || formData.discountType === 'percent') ? "grid-cols-2" : "grid-cols-1"
            )}>
                {/* Chỉ hiển thị trường này khi là giảm theo Phần trăm */}
                {(formData.discountType === 'percentage' || formData.discountType === 'percent') && (
                    <div className="space-y-2">
                        <Label>Giá trị tối đa được giảm</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-400">đ</span>
                            <Input 
                                type="text" 
                                className="pl-8 bg-gray-50 text-gray-500" 
                                value={formData.maxDiscountValue.toLocaleString()} 
                                disabled={true} 
                            />
                        </div>
                    </div>
                )}
                
                <div className="space-y-2">
                    <Label>Giá trị đơn tối thiểu</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-400">đ</span>
                        <Input 
                            type="text" 
                            className="pl-8 bg-gray-50 text-gray-500" 
                            value={formData.minPurchaseValue.toLocaleString()} 
                            disabled={true} 
                        />
                    </div>
                </div>
            </div>

            {/* USAGE LIMIT */}
            <div className="space-y-2">
                 <Label>Giới hạn sử dụng (Lượt)</Label>
                 <Input type="text" value={formData.usageLimit.toLocaleString()} disabled={true} className="bg-gray-50 text-gray-500" />
            </div>

            {/* SWITCH (STATUS) */}
            <div className="flex items-center space-x-2 pointer-events-none opacity-80">
                <Switch
                    checked={formData.isActive}
                    disabled={true}        
                    className="data-[state=checked]:bg-blue-600"
                />
                <Label className="text-gray-500">
                    {formData.isActive ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                </Label>
            </div>

            {/* NGÀY THÁNG (Chỉ hiển thị, không dùng Popover) */}
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2">
                    <Label>Ngày bắt đầu</Label>
                    <Button variant="outline" disabled={true} className="w-full pl-3 text-left font-normal bg-gray-50 text-gray-500">
                        {formData.startDate ? format(formData.startDate, "dd/MM/yyyy", { locale: vi }) : <span>Không có</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-40" />
                    </Button>
                </div>

                <div className="flex flex-col space-y-2">
                    <Label>Ngày kết thúc</Label>
                    <Button variant="outline" disabled={true} className="w-full pl-3 text-left font-normal bg-gray-50 text-gray-500">
                        {formData.endDate ? format(formData.endDate, "dd/MM/yyyy", { locale: vi }) : <span>Không có</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-40" />
                    </Button>
                </div>
            </div>
        </div>

        {/* ACTIONS BUTTONS */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="secondary" type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium">
                Đóng
            </Button>
        </div>
    </div>
  )
}