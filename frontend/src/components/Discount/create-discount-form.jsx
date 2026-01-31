import React, { useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { format } from "date-fns"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export function CreateDiscountForm({ onSubmit, onCancel }) {
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

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit?.(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Tạo mã giảm giá</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Discount Information */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin mã giảm giá</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="code" className="text-sm font-medium text-gray-700 mb-2 block">
                    Mã giảm giá
                  </Label>
                  <Input
                    id="code"
                    placeholder="Nhập mã giảm giá"
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value)}
                    className="border-gray-200 focus:border-[#3B82F6] focus:ring-[#3B82F6]"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 block">
                    Chi tiết
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Mô tả chi tiết về mã giảm giá"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="border-gray-200 focus:border-[#3B82F6] focus:ring-[#3B82F6] min-h-24"
                  />
                </div>
              </div>
            </section>

            <section>          
              <div className="space-y-4">
                <div>
                  <Label htmlFor="minPurchase" className="text-sm font-medium text-gray-700 mb-2 block">
                    Giá trị tối thiểu để áp dụng mã
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">$</span>
                    <Input
                      id="minPurchase"
                      type="number"
                      placeholder="0.00"
                      value={formData.minPurchaseValue}
                      onChange={(e) => handleInputChange('minPurchaseValue', parseFloat(e.target.value) || 0)}
                      className="border-gray-200 focus:border-[#3B82F6] focus:ring-[#3B82F6]"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="usageLimit" className="text-sm font-medium text-gray-700 mb-2 block">
                    Giới hạn sử dụng
                  </Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    placeholder="100"
                    value={formData.usageLimit}
                    onChange={(e) => handleInputChange('usageLimit', parseInt(e.target.value) || 0)}
                    className="border-gray-200 focus:border-[#3B82F6] focus:ring-[#3B82F6]"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">Thời hạn</Label>
                  <div className="flex gap-3 items-center">
                    
                    {/* Start Date Picker */}
                    <div className="flex-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            type="button"
                            className={cn(
                              "w-full justify-start text-left font-normal border-gray-200 hover:bg-white px-3", // Đổi padding
                              !formData.startDate && "text-muted-foreground"
                            )}
                          >
                             <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                             {formData.startDate ? (
                                format(formData.startDate, "dd/MM/yyyy")
                              ) : (
                                <span>Ngày bắt đầu</span>
                              )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.startDate}
                            onSelect={(date) => handleInputChange('startDate', date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <span className="text-gray-400">-</span>
                    
                    {/* End Date Picker */}
                    <div className="flex-1">
                        <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            type="button"
                            className={cn(
                              "w-full justify-start text-left font-normal border-gray-200 hover:bg-white px-3", // Đổi padding
                              !formData.endDate && "text-muted-foreground"
                            )}
                          >
                             <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                             {formData.endDate ? (
                                format(formData.endDate, "dd/MM/yyyy")
                              ) : (
                                <span>Ngày kết thúc</span>
                              )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.endDate}
                            onSelect={(date) => handleInputChange('endDate', date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            {/* Discount Value */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Loại giảm giá</h2>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">Loại giảm giá</Label>
                  <div className="flex gap-0 w-full border border-gray-200 rounded-md overflow-hidden">
                    <button
                      type="button"
                      onClick={() => handleInputChange('discountType', 'percentage')}
                      className={`flex-1 py-2 px-4 font-medium transition-colors ${
                        formData.discountType === 'percentage'
                          ? 'bg-[#3B82F6] text-white'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span>%</span> Phần trăm
                    </button>
                    <div className="w-px bg-gray-200"></div>
                    <button
                      type="button"
                      onClick={() => handleInputChange('discountType', 'fixed')}
                      className={`flex-1 py-2 px-4 font-medium transition-colors ${
                        formData.discountType === 'fixed'
                          ? 'bg-[#3B82F6] text-white'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span>$</span> Số tiền cố định
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="discountValue" className="text-sm font-medium text-gray-700 mb-2 block">
                    Giá trị giảm giá
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">{formData.discountType === 'percentage' ? '%' : '$'}</span>
                    <Input
                      id="discountValue"
                      type="number"
                      placeholder={formData.discountType === 'percentage' ? '10' : '0.00'}
                      value={formData.discountValue}
                      onChange={(e) => handleInputChange('discountValue', parseFloat(e.target.value) || 0)}
                      className="border-gray-200 focus:border-[#3B82F6] focus:ring-[#3B82F6]"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="maxDiscount" className="text-sm font-medium text-gray-700 mb-2 block">
                    Giá trị tối đa được giảm
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">$</span>
                    <Input
                      id="maxDiscount"
                      type="number"
                      placeholder="0.00"
                      value={formData.maxDiscountValue}
                      onChange={(e) => handleInputChange('maxDiscountValue', parseFloat(e.target.value) || 0)}
                      className="border-gray-200 focus:border-[#3B82F6] focus:ring-[#3B82F6]"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Status */}
            <section>
              <div className="flex items-center justify-between">
                <Label htmlFor="status" className="text-base font-semibold text-gray-900">
                  Trạng thái
                </Label>
                <div className="flex items-center gap-2">
                  <Switch
                    id="status"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                    className="data-[state=checked]:bg-[#3B82F6]"
                  />
                  <span className={`text-sm font-medium ${formData.isActive ? 'text-[#3B82F6]' : 'text-gray-500'}`}>
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="px-6 py-2 text-gray-700 border-gray-200 hover:bg-gray-50 bg-transparent"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            className="px-6 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white"
          >
            Tạo mã giảm giá
          </Button>
        </div>
      </div>
    </form>
  )
}