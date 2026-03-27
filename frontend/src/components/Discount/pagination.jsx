import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Pagination({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    // Tạo mảng số trang
    const getPageNumbers = () => {
        let pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
        return pages;
    };

    const pages = getPageNumbers();

    return (
        <div className="flex items-center justify-between mt-4 px-2">
            <p className="text-sm text-gray-500">
                Hiển thị {startItem}-{endItem} của {totalItems} mã giảm giá
            </p>
            <div className="flex items-center gap-1 flex-wrap">
                {/* Thêm flex-wrap nếu số trang quá nhiều sẽ tự xuống dòng */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                {pages.map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={cn(
                            'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                            currentPage === page ? 'bg-[#3B82F6] text-white' : 'text-gray-600 hover:bg-gray-100',
                        )}
                    >
                        {page}
                    </button>
                ))}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
