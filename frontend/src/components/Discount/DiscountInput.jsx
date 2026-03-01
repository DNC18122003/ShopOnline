import React from 'react';
import { toast } from 'react-toastify';
import { X } from 'lucide-react';  
const DiscountInput = ({
    discountCode,
    setDiscountCode,
    discountInfo,
    setDiscountInfo,
    discountError,
    setDiscountError,
    subtotal,
    loading,
    applyDiscount,
    removeDiscount,
    availableDiscounts,
    loadingDiscounts,
    isDiscountListOpen,
    setIsDiscountListOpen,
    discountAmount,
}) => {
    const handleChange = (e) => {
        setDiscountCode(e.target.value);
    };

    const handleSelectDiscount = (code) => {
        setDiscountCode(code);
        setIsDiscountListOpen(false);
       
    };

    return (
        <div className="mb-6">
            <label className="block text-sm mb-2 text-white">Mã giảm giá</label>

            <div className="relative flex items-center">
                <input
                    type="text"
                    value={discountCode}
                    onChange={handleChange}
                    placeholder="Nhập mã giảm giá"
                    disabled={!!discountInfo}
                    className={`flex-1 px-4 py-3 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        discountInfo ? 'pr-10' : 'pr-4'
                    }`}
                />

                {discountInfo && (
                    <button
                        type="button"
                        onClick={removeDiscount}
                        title="Bỏ mã giảm giá"
                        className="absolute right-[120px] top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600 focus:outline-none z-10 transition-colors duration-200"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}

                <button
                    type="button"
                    onClick={applyDiscount}
                    disabled={loading || !discountCode.trim() || !!discountInfo}
                    className={`w-[120px] px-6 py-3 font-medium rounded-r-lg transition ${
                        loading || !!discountInfo
                            ? 'bg-green-400 cursor-not-allowed text-white'
                            : 'bg-white text-blue-600 hover:bg-blue-50'
                    }`}
                >
                    {loading ? 'Đang áp dụng...' : discountInfo ? 'Đã áp dụng' : 'Áp dụng'}
                </button>
            </div>

            {discountError && <p className="text-red-300 text-sm mt-2">{discountError}</p>}

            <div className="mt-3">
                <button
                    type="button"
                    onClick={() => setIsDiscountListOpen(!isDiscountListOpen)}
                    className="text-sm text-white hover:text-blue-200 transition flex items-center gap-2"
                    disabled={loadingDiscounts}
                >
                    <span>Mã giảm giá có sẵn</span>
                    {availableDiscounts.length > 0 && (
                        <span className="bg-white/30 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {availableDiscounts.length}
                        </span>
                    )}
                    <svg
                        className={`w-4 h-4 transition-transform ${isDiscountListOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isDiscountListOpen && (
                    <div className="mt-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 max-h-64 overflow-y-auto">
                        {loadingDiscounts ? (
                            <p className="text-gray-300 text-sm text-center py-4">Đang tải...</p>
                        ) : availableDiscounts.length > 0 ? (
                            <div className="space-y-3">
                                {availableDiscounts.map((disc) => {
                                    const isPercent = disc.discountType === 'percent';
                                    const discountText = isPercent
                                        ? `Giảm ${disc.value}%`
                                        : `Giảm ${disc.value.toLocaleString('vi-VN')}₫`;

                                    return (
                                        <div
                                            key={disc.code}
                                            className="flex justify-between items-center bg-white/70 p-3 rounded-lg hover:bg-white/90 transition cursor-pointer group"
                                            onClick={() => handleSelectDiscount(disc.code)}
                                        >
                                            <div className="flex-1">
                                                <p className="font-bold text-blue-700 group-hover:underline">
                                                    {disc.code}
                                                </p>
                                                <p className="text-sm text-gray-800">
                                                    {discountText}
                                                    {disc.maxDiscountValue > 0 &&
                                                        ` (tối đa ${disc.maxDiscountValue.toLocaleString('vi-VN')}₫)`}
                                                </p>
                                                {disc.minOrderValue > 0 && (
                                                    <p className="text-xs text-gray-600">
                                                        Đơn ≥ {disc.minOrderValue.toLocaleString('vi-VN')}₫
                                                    </p>
                                                )}
                                                {disc.description && (
                                                    <p className="text-xs text-gray-500 mt-1 italic">
                                                        {disc.description}
                                                    </p>
                                                )}
                                            </div>
                                            <span className="text-blue-600 font-medium text-sm group-hover:underline">
                                                Chọn
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-300 text-center py-4">Hiện chưa có mã giảm giá phù hợp</p>
                        )}
                    </div>
                )}
            </div>

            {discountInfo && (
                <p className="mt-3 text-sm text-green-300 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                        />
                    </svg>
                    Đã áp dụng mã <span className="font-bold">-{discountAmount.toLocaleString('vi-VN')}₫</span>
                </p>
            )}
        </div>
    );
};

export default DiscountInput;
