import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Pagination({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const getPageNumbers = () => {
        if (totalPages <= 5) {
            let pages = [];
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
            return pages;
        }
        if (currentPage <= 3) {
            return [1, 2, 3, 4, '...', totalPages];
        }
        if (currentPage >= totalPages - 2) {
            return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        }
        return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    };

    const pages = getPageNumbers();

    return (
        <div className="flex items-center justify-between mt-4 px-2">
            <p className="text-sm text-gray-500">
                Hiển thị {startItem}-{endItem} của {totalItems} mã giảm giá
            </p>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {pages.map((page, index) => {
                    if (page === '...') {
                        return (
                            <span
                                key={`ellipsis-${index}`}
                                className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm"
                            >
                                ...
                            </span>
                        );
                    }
                    return (
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
                    );
                })}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
