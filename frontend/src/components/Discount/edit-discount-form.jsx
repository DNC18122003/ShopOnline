'use client'

import React, { useState } from 'react'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'

export function EditDiscountForm({ discount, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(discount)

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">{formData.code}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Mã giảm giá */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Mã giảm giá</Label>
              <Input
                type="text"
                placeholder="Enter discount code"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value)}
                disabled
                className="bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Chi tiết */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Chi tiết</Label>
              <Textarea
                placeholder="Mô tả chi tiết về mã giảm giá"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="border-gray-200 focus:border-[#3B82F6] focus:ring-[#3B82F6] min-h-32 resize-none bg-gray-50"
              />
            </div>

            {/* Usage Limits & Dates */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Usage Limits & Dates</h3>

              {/* Giá trị tối thiểu */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Giá trị tối thiểu để áp dụng mã
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">$</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.minPurchaseValue}
                    onChange={(e) => handleInputChange('minPurchaseValue', parseFloat(e.target.value) || 0)}
                    className="border-gray-200 focus:border-[#3B82F6] focus:ring-[#3B82F6] bg-gray-50"
                  />
                </div>
              </div>

              {/* Chỉ hạn sử dụng */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Chỉ hạn sử dụng</Label>
                <Input
                  type="number"
                  placeholder="100"
                  value={formData.usageLimit}
                  onChange={(e) => handleInputChange('usageLimit', parseInt(e.target.value) || 100)}
                  className="border-gray-200 focus:border-[#3B82F6] focus:ring-[#3B82F6] bg-gray-50"
                />
              </div>

              {/* Thời hạn */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">Thời hạn</Label>
                <div className="flex gap-3 items-center">
                  <div className="flex-1 relative">
                    <Input
                      type="text"
                      placeholder="mm/dd/yyyy"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className="border border-gray-200 focus:border-[#3B82F6] focus:ring-[#3B82F6] pr-10 h-10 bg-gray-50"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <span className="text-gray-400">-</span>
                  <div className="flex-1 relative">
                    <Input
                      type="text"
                      placeholder="mm/dd/yyyy"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className="border border-gray-200 focus:border-[#3B82F6] focus:ring-[#3B82F6] pr-10 h-10 bg-gray-50"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Discount Value */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Discount Value</h3>

              {/* Discount Type */}
              <div className="mb-4">
                <Label className="text-sm font-medium text-gray-700 mb-3 block">Discount Type</Label>
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

              {/* Giá trị giảm giá */}
              <div className="mb-4">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Giá trị giảm giá</Label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">{formData.discountType === 'percentage' ? '%' : '$'}</span>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.discountValue}
                    onChange={(e) => handleInputChange('discountValue', parseFloat(e.target.value) || 0)}
                    className="border-gray-200 focus:border-[#3B82F6] focus:ring-[#3B82F6] bg-gray-50"
                  />
                </div>
              </div>

              {/* Giá trị tối đa được giảm */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Giá trị tối đa được giảm
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">$</span>
                  <Input
                    type="number"
                    placeholder="50.00"
                    value={formData.maxDiscountValue}
                    onChange={(e) => handleInputChange('maxDiscountValue', parseFloat(e.target.value) || 0)}
                    className="border-gray-200 focus:border-[#3B82F6] focus:ring-[#3B82F6] bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Trạng thái */}
            <div className="flex items-center justify-between pt-4">
              <span className="text-sm font-medium text-gray-700">Trạng thái</span>
              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                  className="data-[state=checked]:bg-[#3B82F6]"
                />
                <span className={formData.isActive ? 'text-[#3B82F6] font-medium' : 'text-gray-500'}>
                  {formData.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
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
            Quay lại
          </Button>
          <Button
            type="submit"
            className="px-6 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white"
          >
            Cập nhật
          </Button>
        </div>
      </div>
    </form>
  )
}