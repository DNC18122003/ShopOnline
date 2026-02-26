"use client"

import { Pencil, Trash2, Copy, Eye } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

export function VoucherTable({
  vouchers,
  onToggle,
  onEdit,
  onDelete,
  onCopyCode,
  onView, // 1. Nhận thêm prop onView
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50">
            <TableHead className="text-gray-500 font-medium text-center">
              Mã giảm giá
            </TableHead>
            <TableHead className="text-gray-500 font-medium text-center">
              Giá trị giảm giá
            </TableHead>
            <TableHead className="text-gray-500 font-medium text-center">
              Giới hạn sử dụng
            </TableHead>
            <TableHead className="text-gray-500 font-medium text-center">
              Khoảng thời gian
            </TableHead>
            <TableHead className="text-gray-500 font-medium text-center">
              Trạng thái
            </TableHead>
            <TableHead className="text-gray-500 font-medium text-center">
              Hành động
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vouchers.map((voucher) => (
            <TableRow key={voucher.id} className="border-b border-gray-100">
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#DBEAFE] text-[#3B82F6] border border-[#93C5FD]">
                    {voucher.code}
                  </span>
                  <button
                    onClick={() => onCopyCode(voucher.code)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Sao chép mã"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <span className="text-lg font-semibold text-gray-900">
                  {voucher.discountValue}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <span className="text-gray-600">
                  Giới hạn: {voucher.usageLimit} người dùng
                </span>
                <span className="text-gray-400 text-sm ml-1">
                  ({voucher.usedCount} đã dùng)
                </span>
              </TableCell>
              <TableCell className="text-center text-gray-600">
                {/* Bạn có thể format lại ngày tháng ở đây nếu cần đẹp hơn */}
                {voucher.startDate} - {voucher.endDate}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                  <Switch
                    checked={voucher.isActive}
                    onCheckedChange={() => onToggle(voucher.id)}
                    className="data-[state=checked]:bg-[#3B82F6]"
                  />
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onView(voucher)}
                    className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                    title="Xem chi tiết"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(voucher)}
                    className="h-8 w-8 text-gray-400 hover:text-orange-600 hover:bg-orange-50"
                    title="Chỉnh sửa"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(voucher.id)}
                    className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}