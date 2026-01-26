'use client';
import React, { useState } from 'react';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { useCart } from '@/context/cartContext';

export default function AddToCartButton({ productId, quantity = 1, className = '' }) {
    const { addToCart } = useCart();
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        if (loading) return;

        try {
            setLoading(true);
            await addToCart(productId, quantity);
        } catch (error) {
            console.error('Add to cart failed', error);
            alert('Không thể thêm sản phẩm vào giỏ hàng');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className={`
        w-full bg-primary text-primary-foreground py-2.5 rounded-lg
        font-medium transition flex items-center justify-center gap-2
        hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed
        ${className}
      `}
        >
            {loading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang thêm...
                </>
            ) : (
                <>
                    <ShoppingCart className="w-4 h-4" />
                    Thêm vào giỏ
                </>
            )}
        </button>
    );
}
