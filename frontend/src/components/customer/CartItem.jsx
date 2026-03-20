// src/components/customer/CartItem.jsx
import { useState, useTransition } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CheckCircle2, Truck, PackageCheck, Minus, Plus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox'; // ← import cái bạn đã tạo
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
const cn = (...inputs) => twMerge(clsx(inputs));

const CartItem = ({ item, onRemove, onUpdateQuantity, isSelected = false, onToggleSelect, isPending = false }) => {
    const localQty = item.quantity;
    const [isPendingLocal, startTransition] = useTransition();

    // const isOutOfStock = item.stock < item.quantity;

  const handleQuantityChange = async (newQty) => {
     if (newQty < 1 || newQty > item.stock) return;
      await onUpdateQuantity(item.productId, newQty);
  };

    return (
        <div
            className={cn(
                'relative flex flex-col sm:flex-row items-start sm:items-center gap-6 py-6 border-b last:border-b-0',
                isPendingLocal && 'opacity-60 pointer-events-none',
            )}
        >
            {/* Checkbox chọn để thanh toán */}
            <div className="absolute top-6 left-0 sm:static sm:mt-2">
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleSelect(item.productId)}
                    disabled={isPending || isPendingLocal}
                />
            </div>

            <button
                type="button"
                onClick={() => onRemove(item.productId)}
                disabled={isPending || isPendingLocal}
                className={cn(
                    'absolute top-4 right-4 z-10',
                    'text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none',
                    'transition-colors duration-150',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                )}
                aria-label="Xóa sản phẩm"
            >
                ×
            </button>

            <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-gray-50 rounded-md overflow-hidden border ml-10 sm:ml-0">
                <img
                    src={item.imageSnapshot || '/placeholder-product.png'}
                    alt={item.nameSnapshot}
                    className="w-full h-full object-contain"
                    onError={(e) => (e.target.src = '/placeholder-product.png')}
                />
            </div>

            <div className="flex-1 min-w-0 space-y-2">
                <div>
                    <Link to={`/product/${item.productId}`} className="hover:text-blue-600 transition-colors">
                        <h3 className="font-medium text-base sm:text-lg line-clamp-2 pr-10 cursor-pointer">
                            {item.nameSnapshot}
                        </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {item.descriptionSnapshot || item.nameSnapshot || 'Không có mô tả chi tiết'}
                    </p>
                </div>

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

                <div className="flex items-center justify-between sm:justify-start gap-6 mt-3">
                    <div className="font-semibold text-lg">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                            item.priceSnapshot,
                        )}
                    </div>

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

                        <input
                            type="number"
                            min={1}
                            max={item.stock}
                            value={localQty}
                            onChange={(e) => {
                                let value = Number(e.target.value);

                               if (!Number.isInteger(value)) return;

                                if (value < 1) value = 1;
                                if (value > item.stock) value = item.stock;

                                handleQuantityChange(value);
                            }}
                            className="w-14 text-center outline-none"
                            disabled={isPending || isPendingLocal}
                        />

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-none border-l"
                            onClick={() => handleQuantityChange(localQty + 1)}
                            disabled={localQty >= item.stock || isPending || isPendingLocal}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartItem;
