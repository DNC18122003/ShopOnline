'use client';
import React, { useState } from 'react';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { useCart } from '@/context/cartContext';
import { toast } from 'react-toastify';

export default function AddToCartButton({
    productId,
    name,
    price,
    image,
    quantity = 1,
    className = '',
    disabled = false,
}) {
    const { addToCart } = useCart();
    const [loading, setLoading] = useState(false);

    const isDisabled = loading || disabled || !productId;

    const handleClick = async () => {
        console.log('CLICK ADD TO CART BUTTON');
        if (isDisabled) return;

        setLoading(true);
        try {
            console.log('CALLING addToCart FUNCTION');
            await addToCart({
                productId,
                quantity,
                nameSnapshot: name || 'Sản phẩm',
                priceSnapshot: price || 0,
                imageSnapshot: image || '/placeholder-product.png',
            });
            toast.success('Thêm giỏ hàng thành công !');
        } catch (err) {
            console.error('Add to cart error:', err);
            alert('Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={isDisabled}
            className={`
                        group relative
                        w-full
                        bg-blue-600
                        text-white 
                        font-medium text-base
                        py-3 px-6 
                        rounded-xl
                        flex items-center justify-center gap-2.5
                        shadow-md shadow-primary/20
                        transition-all duration-300 ease-out
                        hover:shadow-xl hover:shadow-primary/30
                        hover:scale-[1.02] active:scale-[0.98]
                        disabled:opacity-60 disabled:scale-100 disabled:shadow-none
                        disabled:cursor-not-allowed
                        cursor-pointer
                        overflow-hidden
        ${className}
      `}
        >
            <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {loading ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang thêm...</span>
                </>
            ) : (
                <>
                    <ShoppingCart className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                    <span>Thêm vào giỏ hàng</span>
                </>
            )}
        </button>
    );
}
