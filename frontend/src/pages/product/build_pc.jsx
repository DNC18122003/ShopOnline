'use client';

import React, { useMemo } from 'react';
import { Check, AlertCircle } from 'lucide-react';

interface OrderSummaryProps {
  selectedItems: Record<string, any>;
}

export default function OrderSummary({ selectedItems }: OrderSummaryProps) {
  const isCompatible = true; // You can add compatibility checking logic here
  const tax = 10; // 10% tax

  const subtotal = useMemo(() => {
    return Object.values(selectedItems).reduce((sum, item) => {
      return sum + (item?.price || 0);
    }, 0);
  }, [selectedItems]);

  const taxAmount = Math.round(subtotal * (tax / 100));
  const total = subtotal + taxAmount;

  return (
    <aside className="col-span-3">
      <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24 space-y-6">
        {/* Compatibility Check */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3">Kiểm tra tương thích</h3>
          <div
            className={`flex items-center gap-3 p-4 rounded-lg ${
              isCompatible
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isCompatible ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              {isCompatible ? (
                <Check size={16} className="text-white" />
              ) : (
                <AlertCircle size={16} className="text-white" />
              )}
            </div>
            <span
              className={`text-sm font-medium ${
                isCompatible ? 'text-green-700' : 'text-red-700'
              }`}
            >
              {isCompatible
                ? 'Tương thích hoàn toàn'
                : 'Có vấn đề tương thích'}
            </span>
          </div>
        </div>

        {/* Current Configuration */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3">Cấu hình hiện tại</h3>
          <div className="space-y-2">
            {/* CPU */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">
                {selectedItems.cpu ? selectedItems.cpu.name : 'Chưa chọn CPU'}
              </span>
              {selectedItems.cpu && (
                <span className="text-sm font-semibold text-blue-600">
                  {selectedItems.cpu.price.toLocaleString('vi-VN')}đ
                </span>
              )}
            </div>

            {/* GPU */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">
                {selectedItems.gpu ? selectedItems.gpu.name : 'Chưa chọn GPU'}
              </span>
              {selectedItems.gpu && (
                <span className="text-sm font-semibold text-blue-600">
                  {selectedItems.gpu.price.toLocaleString('vi-VN')}đ
                </span>
              )}
            </div>

            {/* RAM */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">
                {selectedItems.ram ? selectedItems.ram.name : 'Chưa chọn RAM'}
              </span>
              {selectedItems.ram && (
                <span className="text-sm font-semibold text-blue-600">
                  {selectedItems.ram.price.toLocaleString('vi-VN')}đ
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Price Summary */}
        <div className="border-t border-gray-200 pt-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tổng phụ:</span>
            <span className="text-gray-900 font-semibold">
              {subtotal.toLocaleString('vi-VN')}đ
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Thuế (10%):</span>
            <span className="text-gray-900 font-semibold">
              {taxAmount.toLocaleString('vi-VN')}đ
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="font-bold text-gray-900">Tổng cộng:</span>
            <span className="text-2xl font-bold text-blue-600">
              {total.toLocaleString('vi-VN')}đ
            </span>
          </div>
        </div>

        {/* Checkout Button */}
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors">
          Thanh toán ngay
        </button>

        <p className="text-xs text-center text-gray-500">Lưu cấu hình</p>
      </div>
    </aside>
  );
}
