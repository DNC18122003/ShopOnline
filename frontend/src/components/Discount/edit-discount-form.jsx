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

// Component hiển thị lỗi
const ErrorAlert = ({ message }) => {
    if (!message) return null;
    return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4 text-sm flex items-center animate-in fade-in slide-in-from-top-2">
            <span className="font-bold mr-2">Lỗi:</span>
            <span>{message}</span>
        </div>
    );
};

export function EditDiscountForm({ initialData, onSubmit, onCancel, readOnly = false }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    _id: '',
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    maxDiscountValue: '',
    minPurchaseValue: '',
    usageLimit: '',
    startDate: undefined,
    endDate: undefined,
    isActive: true,
  })

  useEffect(() => {
    // SỬA Ở ĐÂY: Thêm Object.keys(initialData).length > 0 để tránh lỗi màn hình trắng khi View
    if (initialData && Object.keys(initialData).length > 0) {
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
        _id: initialData._id || initialData.id || '',
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
    if (readOnly) return; 
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errorMessage) setErrorMessage('');
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (readOnly) return;
    
    setIsSubmitting(true);
    setErrorMessage('');

    const { 
        description, discountType, discountValue, 
        maxDiscountValue, minPurchaseValue, usageLimit, 
        startDate, endDate 
    } = formData;

    // --- 1. VALIDATE DỮ LIỆU ---
    if (!description) {
        setIsSubmitting(false); return setErrorMessage("Vui lòng nhập mô tả chi tiết cho mã.");
    }
    if (description.length > 100) {
        setIsSubmitting(false); return setErrorMessage("Mô tả không được quá 100 ký tự.");
    }

    if (minPurchaseValue === '' || minPurchaseValue === undefined) {
        setIsSubmitting(false); return setErrorMessage("Vui lòng nhập giá trị tối thiểu để áp dụng mã.");
    }
    if (Number(minPurchaseValue) < 0) {
        setIsSubmitting(false); return setErrorMessage("Giá trị tối thiểu đơn hàng không được âm.");
    }

    if (usageLimit === '' || usageLimit === undefined) {
        setIsSubmitting(false); return setErrorMessage("Vui lòng nhập giới hạn số lượt sử dụng.");
    }
    if (Number(usageLimit) < 0) {
        setIsSubmitting(false); return setErrorMessage("Giới hạn sử dụng không được âm.");
    }

    if (discountValue === '' || discountValue === undefined) {
        setIsSubmitting(false); return setErrorMessage("Vui lòng nhập giá trị giảm giá.");
    }
    const numValue = Number(discountValue);
    if (numValue <= 0) {
        setIsSubmitting(false); return setErrorMessage("Giá trị giảm giá phải lớn hơn 0.");
    }

    if (discountType === 'percentage' || discountType === 'percent') {
        if (numValue > 100) {
            setIsSubmitting(false); return setErrorMessage("Phần trăm giảm không được quá 100%.");
        }
        if (maxDiscountValue === '' || maxDiscountValue === undefined) {
            setIsSubmitting(false); return setErrorMessage("Vui lòng nhập mức giảm tối đa (VNĐ) cho loại phần trăm.");
        }
        if (Number(maxDiscountValue) < 0) {
            setIsSubmitting(false); return setErrorMessage("Mức giảm tối đa không được âm.");
        }
    }

    if (!startDate) {
        setIsSubmitting(false); return setErrorMessage("Vui lòng chọn ngày bắt đầu.");
    }
    if (!endDate) {
        setIsSubmitting(false); return setErrorMessage("Vui lòng chọn ngày kết thúc.");
    }
    if (startDate >= endDate) {
        setIsSubmitting(false); return setErrorMessage("Ngày kết thúc phải sau ngày bắt đầu.");
    }

    const now = new Date();
    now.setHours(0,0,0,0);
    if (endDate < now) {
         setIsSubmitting(false); return setErrorMessage("Thời gian kết thúc không được ở trong quá khứ.");
    }

    // --- 2. GỌI HÀM SUBMIT VỚI PAYLOAD CHUẨN ---
    const payload = {
        code: formData.code, 
        description: description,
        discountType: discountType === 'percentage' ? 'percent' : 'fixed', 
        value: Number(discountValue), 
        minOrderValue: Number(minPurchaseValue),
        maxDiscountValue: (discountType === 'percentage' || discountType === 'percent') ? Number(maxDiscountValue) : 0,
        usageLimit: Number(usageLimit),
        validFrom: startDate.toISOString(),
        expiredAt: endDate.toISOString(),
        status: formData.isActive ? 'active' : 'inactive'
    };

    try {
        // SỬA Ở ĐÂY: Thêm lớp bảo vệ ID cuối cùng trước khi gọi API
        const currentId = formData._id;
        if (!currentId) {
            setIsSubmitting(false); 
            return setErrorMessage("Lỗi hệ thống: Không tìm thấy ID của mã giảm giá.");
        }

        await onSubmit(currentId, payload);
    } catch (error) {
        console.error("Form Submit Error:", error);
        const msg = error.response?.data?.message || error.message || "Có lỗi xảy ra, vui lòng thử lại.";
        setErrorMessage(msg);
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
        <div className="grid gap-6">
            
            {/* Hiển thị lỗi */}
            <ErrorAlert message={errorMessage} />

            {/* CODE - Luôn disable */}
            <div className="grid gap-2">
                <Label htmlFor="code">Mã giảm giá</Label>
                <Input id="code" value={formData.code} disabled={true} className="bg-gray-100 font-bold text-gray-500" />
            </div>

            {/* DESCRIPTION */}
            <div className="grid gap-2">
                <Label htmlFor="description">Chi tiết <span className="text-red-500">*</span></Label>
                <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    disabled={readOnly}
                    className={cn(errorMessage.includes("Mô tả") || errorMessage.includes("Chi tiết") ? "border-red-500 focus-visible:ring-red-500" : "")}
                />
            </div>

            {/* BUTTON GROUP - Loại giảm giá */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Loại giảm giá <span className="text-red-500">*</span></Label>
                    <div className="flex rounded-md shadow-sm">
                        <button
                          type="button"
                          disabled={readOnly}
                          onClick={() => handleInputChange('discountType', 'percentage')}
                          className={cn(
                            "flex-1 px-4 py-2 text-sm font-medium border first:rounded-l-md last:rounded-r-md transition-colors",
                            (formData.discountType === 'percentage' || formData.discountType === 'percent')
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
                             readOnly && "opacity-70 cursor-not-allowed hover:bg-white"
                          )}
                        >
                          % Phần trăm
                        </button>
                        <button
                          type="button"
                          disabled={readOnly}
                          onClick={() => handleInputChange('discountType', 'fixed')}
                          className={cn(
                            "flex-1 px-4 py-2 text-sm font-medium border -ml-px first:rounded-l-md last:rounded-r-md transition-colors",
                            formData.discountType === 'fixed'
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
                             readOnly && "opacity-70 cursor-not-allowed hover:bg-white"
                          )}
                        >
                          ₫ Tiền cố định
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Giá trị giảm giá <span className="text-red-500">*</span></Label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500 font-medium">
                             {(formData.discountType === 'percentage' || formData.discountType === 'percent') ? '%' : '₫'}
                        </span>
                        <Input
                            type="number"
                            className={cn("pl-8", (errorMessage.includes("Giá trị giảm") || errorMessage.includes("Phần trăm")) ? "border-red-500" : "")}
                            value={formData.discountValue}
                            onChange={(e) => handleInputChange('discountValue', e.target.value)}
                            disabled={readOnly}
                        />
                    </div>
                </div>
            </div>

            {/* CÁC INPUT SỐ KHÁC VÀ GIỚI HẠN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Mức giảm tối đa (Chỉ hiển thị khi là % ) */}
                {(formData.discountType === 'percentage' || formData.discountType === 'percent') && (
                    <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                        <Label>Giá trị tối đa được giảm <span className="text-red-500">*</span></Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-500">₫</span>
                            <Input 
                                type="number" 
                                className={cn("pl-8", errorMessage.includes("Mức giảm tối đa") ? "border-red-500" : "")} 
                                value={formData.maxDiscountValue} 
                                onChange={(e) => handleInputChange('maxDiscountValue', e.target.value)}
                                disabled={readOnly} 
                            />
                        </div>
                    </div>
                )}
                
                <div className="space-y-2">
                    <Label>Giá trị đơn tối thiểu <span className="text-red-500">*</span></Label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500">₫</span>
                        <Input 
                            type="number" 
                            className={cn("pl-8", errorMessage.includes("tối thiểu") ? "border-red-500" : "")} 
                            value={formData.minPurchaseValue}
                            onChange={(e) => handleInputChange('minPurchaseValue', e.target.value)}
                            disabled={readOnly}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                     <Label>Giới hạn sử dụng (Lượt) <span className="text-red-500">*</span></Label>
                     <Input 
                        type="number" 
                        value={formData.usageLimit}
                        className={cn(errorMessage.includes("số lượt") || errorMessage.includes("Giới hạn") ? "border-red-500" : "")}
                        onChange={(e) => handleInputChange('usageLimit', e.target.value)}
                        disabled={readOnly}
                      />
                </div>
            </div>

            {/* SWITCH */}
            <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg border border-gray-100 w-fit">
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
                <Label className={cn("font-medium", readOnly ? "text-gray-700" : "", formData.isActive ? 'text-blue-600' : 'text-gray-500')}>
                    {formData.isActive ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                </Label>
            </div>

            {/* NGÀY THÁNG */}
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2">
                    <Label>Ngày bắt đầu <span className="text-red-500">*</span></Label>
                    <Popover>
                        <PopoverTrigger asChild disabled={readOnly}>
                            <Button 
                                variant={"outline"} 
                                className={cn(
                                    "w-full pl-3 text-left font-normal", 
                                    !formData.startDate && "text-muted-foreground",
                                    errorMessage.includes("ngày bắt đầu") && "border-red-500 text-red-500"
                                )}
                            >
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
                    <Label>Ngày kết thúc <span className="text-red-500">*</span></Label>
                    <Popover>
                        <PopoverTrigger asChild disabled={readOnly}>
                             <Button 
                                variant={"outline"} 
                                className={cn(
                                    "w-full pl-3 text-left font-normal", 
                                    !formData.endDate && "text-muted-foreground",
                                    (errorMessage.includes("ngày kết thúc") || errorMessage.includes("quá khứ")) && "border-red-500 text-red-500"
                                )}
                             >
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
        <div className="flex justify-end space-x-2 pt-4 border-t mt-6">
            {readOnly ? (
                <Button variant="secondary" type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300">
                    Đóng
                </Button>
            ) : (
                <>
                    <Button variant="outline" type="button" onClick={onCancel} disabled={isSubmitting}>Hủy bỏ</Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 min-w-[140px]" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý</>
                        ) : (
                            "Lưu thay đổi"
                        )}
                    </Button>
                </>
            )}
        </div>
    </form>
  )
}