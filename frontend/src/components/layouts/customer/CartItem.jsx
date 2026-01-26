// src/pages/cart/components/CartItem.jsx
import { useState, useTransition } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Trash2, Plus, Minus, CheckCircle2, Truck, PackageCheck } from 'lucide-react';


import { Button } from '@/components/ui/button'; 
const cn = (...inputs) => twMerge(clsx(inputs));

const CartItem = ({ item, onRemove, onUpdateQuantity, isPending = false }) => {
    const [localQty, setLocalQty] = useState(item.quantity);
    const [isPendingLocal, startTransition] = useTransition();

    const isOutOfStock = item.stock < item.quantity; 

    const handleQuantityChange = (newQty) => {
        if (newQty < 1 || newQty > 99) return;

        setLocalQty(newQty);
        startTransition(() => {
            onUpdateQuantity(item.productId, newQty);
        });
    };

    return (
        <div
            className={cn(
                'flex flex-col sm:flex-row items-start sm:items-center gap-4 py-6 border-b last:border-b-0',
                isPendingLocal && 'opacity-60 pointer-events-none',
            )}
        >
            {/* Hình ảnh sản phẩm */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-gray-50 rounded-md overflow-hidden border">
                <img
                    src={item.imageSnapshot || '/placeholder-product.png'}
                    alt={item.nameSnapshot}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                        e.target.src = '/placeholder-product.png';
                    }}
                />
            </div>

            {/* Thông tin chính */}
            <div className="flex-1 min-w-0 space-y-2">
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <h3 className="font-medium text-base sm:text-lg line-clamp-2">{item.nameSnapshot}</h3>
                        {/* Specs ngắn gọn - tùy chỉnh theo dữ liệu bạn có */}
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {item.descriptionSnapshot || 'Intel i9 • RTX 4070 • 16GB RAM • 1TB SSD • 16" QHD 240Hz'}
                        </p>
                    </div>

                    {/* Nút xóa trên mobile */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 sm:hidden"
                        onClick={() => onRemove(item.productId)}
                        disabled={isPending || isPendingLocal}
                    >
                        <Trash2 className="h-5 w-5" />
                    </Button>
                </div>

                {/* Trạng thái */}
                <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                        {item.stock > 0 ? (
                            <>
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <span className="text-green-700 font-medium">In Stock</span>
                            </>
                        ) : (
                            <>
                                <PackageCheck className="h-4 w-4 text-amber-600" />
                                <span className="text-amber-700">Low Stock</span>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Truck className="h-4 w-4" />
                        <span>Free Shipping</span>
                    </div>
                </div>

                {/* Giá + số lượng */}
                <div className="flex items-center justify-between sm:justify-start gap-6 mt-3">
                    <div className="font-semibold text-lg">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                            item.priceSnapshot * item.quantity,
                        )}
                    </div>

                    {/* Controls số lượng */}
                    <div className="flex items-center border rounded-md overflow-hidden">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-none border-r"
                            onClick={() => handleQuantityChange(localQty - 1)}
                            disabled={localQty <= 1 || isPending || isPendingLocal}
                        >
                            <Minus className="h-4 w-4" />
                        </Button>

                        <div className="w-12 text-center font-medium">{localQty}</div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-none border-l"
                            onClick={() => handleQuantityChange(localQty + 1)}
                            disabled={localQty >= 99 || isOutOfStock || isPending || isPendingLocal}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Nút xóa trên desktop */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 mt-2 hidden sm:flex items-center gap-1.5 p-0 h-auto"
                    onClick={() => onRemove(item.productId)}
                    disabled={isPending || isPendingLocal}
                >
                    <Trash2 className="h-4 w-4" />
                    <span>Xóa</span>
                </Button>
            </div>
        </div>
    );
};

export default CartItem;
