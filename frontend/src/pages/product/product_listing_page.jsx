'use client';
import React, { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ShoppingCart, Star } from 'lucide-react';
import AddToCartButton from '@/components/layouts/customer/AddToCartButton';

function ProductCard({ _id, name, brand, price, originalPrice, rating, reviews, image, badge }) {
    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="relative bg-muted p-6">
                <div className="text-6xl text-center">🖥️</div>
                <div className="absolute top-2 left-2 bg-secondary px-2 py-1 rounded-md text-xs font-medium text-secondary-foreground">
                    {brand}
                </div>
                {badge && (
                    <div className="absolute top-2 right-2 bg-primary px-2 py-1 rounded-md text-xs font-medium text-primary-foreground">
                        {badge}
                    </div>
                )}
            </div>
            <div className="p-4">
                <p className="text-xs text-muted-foreground mb-1">{brand}</p>
                <h3 className="font-semibold text-foreground mb-2 line-clamp-2 h-12">{name}</h3>
                <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                            key={i}
                            className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">({reviews})</span>
                </div>
                <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-xl font-bold text-primary">{formatVND(price)}</span>
                    <span className="text-sm text-muted-foreground line-through">{formatVND(originalPrice)}</span>
                </div>
                {/* <button className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 transition flex items-center justify-center gap-2">
          <ShoppingCart className="w-4 h-4" />
          Thêm Vào Giỏ
        </button> */}
                <AddToCartButton productId={_id} />
            </div>
        </div>
    );
}

const mockProducts = [
    {
        _id: '65a1f0a1b2c3d4e5f6010001',
        name: 'NVIDIA GeForce RTX 4090',
        brand: 'NVIDIA',
        price: 38900000,
        originalPrice: 48900000,
        rating: 5,
        reviews: 234,
        badge: 'Card Đồ Họa',
        category: 'GPU',
    },
    {
        _id: '65a1f0a1b2c3d4e5f6010002',
        name: 'NVIDIA GeForce RTX 4080',
        brand: 'NVIDIA',
        price: 29200000,
        originalPrice: 38900000,
        rating: 5,
        reviews: 189,
        badge: 'Card Đồ Họa',
        category: 'GPU',
    },
    {
        _id: '65a1f0a1b2c3d4e5f6010003',
        name: 'Intel Core i9-13900K',
        brand: 'Intel',
        price: 12990000,
        originalPrice: 16900000,
        rating: 5,
        reviews: 156,
        badge: 'CPU',
        category: 'CPU',
    },
    {
        _id: '65a1f0a1b2c3d4e5f6010004',
        name: 'ASUS ROG Strix Z690-E',
        brand: 'ASUS',
        price: 14600000,
        originalPrice: 19500000,
        rating: 5,
        reviews: 78,
        badge: 'Bo Mạch Chủ',
        category: 'Mainboard',
    },
    {
        _id: '65a1f0a1b2c3d4e5f6010005',
        name: 'NVIDIA GeForce RTX 4070',
        brand: 'NVIDIA',
        price: 19500000,
        originalPrice: 24400000,
        rating: 4,
        reviews: 302,
        badge: 'Card Đồ Họa',
        category: 'GPU',
    },
    {
        _id: '65a1f0a1b2c3d4e5f6010006',
        name: 'Corsair Vengeance DDR5 32GB',
        brand: 'Corsair',
        price: 3400000,
        originalPrice: 4300000,
        rating: 5,
        reviews: 142,
        badge: 'RAM',
        category: 'RAM',
    },
    {
        _id: '65a1f0a1b2c3d4e5f6010007',
        name: 'Samsung 980 PRO 1TB',
        brand: 'Samsung',
        price: 2900000,
        originalPrice: 3700000,
        rating: 5,
        reviews: 456,
        badge: 'SSD',
        category: 'Ổ cứng',
    },
    {
        _id: '65a1f0a1b2c3d4e5f6010008',
        name: 'Corsair RM850x 850W',
        brand: 'Corsair',
        price: 3800000,
        originalPrice: 4800000,
        rating: 5,
        reviews: 267,
        badge: 'PSU',
        category: 'PSU',
    },
];


export default function ProductListingPage({ products = mockProducts }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('best-match');

    const [expandedSections, setExpandedSections] = useState(new Set(['category']));

    // State cho các filter
    const [selectedCategories, setSelectedCategories] = useState(new Set());
    const [selectedPriceRanges, setSelectedPriceRanges] = useState(new Set());
    const [selectedBrands, setSelectedBrands] = useState(new Set());
    const [selectedSpecs, setSelectedSpecs] = useState(new Set());

    const toggleSection = (section) => {
        setExpandedSections((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(section)) {
                newSet.delete(section);
            } else {
                newSet.add(section);
            }
            return newSet;
        });
    };

    const toggleFilter = (filterSet, setFilterSet, value) => {
        setFilterSet((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(value)) {
                newSet.delete(value);
            } else {
                newSet.add(value);
            }
            return newSet;
        });
    };

    const clearAllFilters = () => {
        setSelectedCategories(new Set());
        setSelectedPriceRanges(new Set());
        setSelectedBrands(new Set());
        setSelectedSpecs(new Set());
    };

    const itemsPerPage = 6;
    const totalPages = Math.ceil(products.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const displayedProducts = products.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar */}
            <aside className="w-72 border-r border-border bg-card p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">Bộ Lọc</h2>
                    <button onClick={clearAllFilters} className="text-sm text-primary hover:underline">
                        Xóa Tất Cả
                    </button>
                </div>

                {/* Category Filter */}
                <div className="mb-4">
                    <button
                        onClick={() => toggleSection('category')}
                        className="w-full flex items-center justify-between py-2 hover:bg-sidebar-accent/30 rounded-lg px-2 transition"
                    >
                        <span className="font-medium text-foreground">Danh Mục</span>
                        {expandedSections.has('category') ? (
                            <ChevronDown className="w-4 h-4" />
                        ) : (
                            <ChevronRight className="w-4 h-4" />
                        )}
                    </button>
                    {expandedSections.has('category') && (
                        <div className="mt-2 space-y-2 pl-2">
                            {[
                                { label: 'CPU', count: 89 },
                                { label: 'VGA', count: 247 },
                                { label: 'RAM', count: 156 },
                                { label: 'Ổ cứng SSD', count: 203 },
                                { label: 'Ổ cứng HDD', count: 203 },
                                { label: 'Mainboard', count: 134 },
                                { label: 'Nguồn', count: 98 },
                                { label: 'Tản nhiệt', count: 76 },
                                { label: 'Case', count: 112 },
                            ].map((cat) => (
                                <label
                                    key={cat.label}
                                    className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-1 rounded"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories.has(cat.label)}
                                        onChange={() =>
                                            toggleFilter(selectedCategories, setSelectedCategories, cat.label)
                                        }
                                        className="w-4 h-4 rounded border-gray-300"
                                    />
                                    <span className="text-lg">{cat.icon}</span>
                                    <span className="text-sm text-muted-foreground flex-1">
                                        {cat.label} ({cat.count})
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Price Range Filter */}
                <div className="mb-4">
                    <button
                        onClick={() => toggleSection('price')}
                        className="w-full flex items-center justify-between py-2 hover:bg-sidebar-accent/30 rounded-lg px-2 transition"
                    >
                        <span className="font-medium text-foreground">Khoảng Giá</span>
                        {expandedSections.has('price') ? (
                            <ChevronDown className="w-4 h-4" />
                        ) : (
                            <ChevronRight className="w-4 h-4" />
                        )}
                    </button>
                    {expandedSections.has('price') && (
                        <div className="mt-2 space-y-2 pl-2">
                            {['Dưới 5 triệu', '5 - 10 triệu', '10 - 20 triệu', '20 - 40 triệu', 'Trên 40 triệu'].map(
                                (range) => (
                                    <label
                                        key={range}
                                        className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-1 rounded"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedPriceRanges.has(range)}
                                            onChange={() =>
                                                toggleFilter(selectedPriceRanges, setSelectedPriceRanges, range)
                                            }
                                            className="w-4 h-4 rounded border-gray-300"
                                        />
                                        <span className="text-sm text-muted-foreground">{range}</span>
                                    </label>
                                ),
                            )}
                        </div>
                    )}
                </div>

                {/* Brand Filter */}
                <div className="mb-4">
                    <button
                        onClick={() => toggleSection('brand')}
                        className="w-full flex items-center justify-between py-2 hover:bg-sidebar-accent/30 rounded-lg px-2 transition"
                    >
                        <span className="font-medium text-foreground">Thương Hiệu</span>
                        {expandedSections.has('brand') ? (
                            <ChevronDown className="w-4 h-4" />
                        ) : (
                            <ChevronRight className="w-4 h-4" />
                        )}
                    </button>
                    {expandedSections.has('brand') && (
                        <div className="mt-2 space-y-2 pl-2">
                            {[
                                { label: 'NVIDIA', count: 89 },
                                { label: 'AMD', count: 67 },
                                { label: 'Intel', count: 78 },
                                { label: 'ASUS', count: 145 },
                                { label: 'MSI', count: 134 },
                                { label: 'Gigabyte', count: 98 },
                                { label: 'Corsair', count: 76 },
                                { label: 'Samsung', count: 54 },
                            ].map((brand) => (
                                <label
                                    key={brand.label}
                                    className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-1 rounded"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedBrands.has(brand.label)}
                                        onChange={() => toggleFilter(selectedBrands, setSelectedBrands, brand.label)}
                                        className="w-4 h-4 rounded border-gray-300"
                                    />
                                    <span className="text-sm text-muted-foreground">
                                        {brand.label} ({brand.count})
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Specifications Filter */}
                <div className="mb-4">
                    <button
                        onClick={() => toggleSection('specs')}
                        className="w-full flex items-center justify-between py-2 hover:bg-sidebar-accent/30 rounded-lg px-2 transition"
                    >
                        <span className="font-medium text-foreground">Thông Số</span>
                        {expandedSections.has('specs') ? (
                            <ChevronDown className="w-4 h-4" />
                        ) : (
                            <ChevronRight className="w-4 h-4" />
                        )}
                    </button>
                    {expandedSections.has('specs') && (
                        <div className="mt-2 space-y-3 pl-2">
                            {/* Socket */}
                            <div>
                                <p className="text-xs font-medium text-foreground mb-1">Socket</p>
                                <div className="space-y-1">
                                    {['LGA1700', 'AM5', 'AM4'].map((socket) => (
                                        <label
                                            key={socket}
                                            className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-1 rounded"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedSpecs.has(`socket-${socket}`)}
                                                onChange={() =>
                                                    toggleFilter(selectedSpecs, setSelectedSpecs, `socket-${socket}`)
                                                }
                                                className="w-4 h-4 rounded border-gray-300"
                                            />
                                            <span className="text-sm text-muted-foreground">{socket}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* RAM Type */}
                            <div>
                                <p className="text-xs font-medium text-foreground mb-1">Loại RAM</p>
                                <div className="space-y-1">
                                    {['DDR5', 'DDR4'].map((ramType) => (
                                        <label
                                            key={ramType}
                                            className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-1 rounded"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedSpecs.has(`ram-${ramType}`)}
                                                onChange={() =>
                                                    toggleFilter(selectedSpecs, setSelectedSpecs, `ram-${ramType}`)
                                                }
                                                className="w-4 h-4 rounded border-gray-300"
                                            />
                                            <span className="text-sm text-muted-foreground">{ramType}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Capacity */}
                            <div>
                                <p className="text-xs font-medium text-foreground mb-1">Dung Lượng</p>
                                <div className="space-y-1">
                                    {['8GB', '16GB', '32GB', '64GB'].map((capacity) => (
                                        <label
                                            key={capacity}
                                            className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-1 rounded"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedSpecs.has(`capacity-${capacity}`)}
                                                onChange={() =>
                                                    toggleFilter(
                                                        selectedSpecs,
                                                        setSelectedSpecs,
                                                        `capacity-${capacity}`,
                                                    )
                                                }
                                                className="w-4 h-4 rounded border-gray-300"
                                            />
                                            <span className="text-sm text-muted-foreground">{capacity}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Form Factor */}
                            <div>
                                <p className="text-xs font-medium text-foreground mb-1">Form Factor</p>
                                <div className="space-y-1">
                                    {['ATX', 'Micro-ATX', 'Mini-ITX'].map((form) => (
                                        <label
                                            key={form}
                                            className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-1 rounded"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedSpecs.has(`form-${form}`)}
                                                onChange={() =>
                                                    toggleFilter(selectedSpecs, setSelectedSpecs, `form-${form}`)
                                                }
                                                className="w-4 h-4 rounded border-gray-300"
                                            />
                                            <span className="text-sm text-muted-foreground">{form}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                {/* Section Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Linh Kiện PC</h1>
                    <div className="flex items-center justify-between">
                        <p className="text-muted-foreground">Tìm thấy {products.length} sản phẩm</p>
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-muted-foreground">Sắp xếp:</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="best-match">Phù Hợp Nhất</option>
                                <option value="price-asc">Giá: Thấp đến Cao</option>
                                <option value="price-desc">Giá: Cao đến Thấp</option>
                                <option value="newest">Mới Nhất</option>
                                <option value="rating">Đánh Giá Cao Nhất</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {displayedProducts.map((product, index) => (
                        <ProductCard key={index} {...product} />
                    ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center gap-2">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    {Array.from({ length: totalPages }).map((_, i) => {
                        const page = i + 1;
                        if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                            return (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-10 h-10 rounded-lg font-medium transition ${
                                        currentPage === page
                                            ? 'bg-primary text-primary-foreground'
                                            : 'border border-border hover:bg-secondary text-foreground'
                                    }`}
                                >
                                    {page}
                                </button>
                            );
                        } else if (
                            (page === currentPage - 2 && currentPage > 3) ||
                            (page === currentPage + 2 && currentPage < totalPages - 2)
                        ) {
                            return (
                                <span key={page} className="px-2 text-muted-foreground">
                                    ...
                                </span>
                            );
                        }
                        return null;
                    })}

                    <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </main>
        </div>
    );
}
