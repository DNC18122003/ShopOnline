import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight, ShoppingCart, Star } from 'lucide-react';
import { getProducts } from '@/services/product/product.api';
import { getCategories } from '@/services/category/category.api';
import { getBrands } from '@/services/brand/brand.api';
import AddToCartButton from '@/components/customer/AddToCartButton';

function ProductCard({ _id, name, price, averageRating, reviewCount, images, badge }) {
    const navigate = useNavigate();
    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div onClick={() => navigate(`/product/${_id}`)} className="cursor-pointer">
                <div className="relative bg-muted p-6">
                    <div className="relative bg-muted p-6 flex items-center justify-center h-48">
                        {images ? (
                            <img src={images} alt={name} className="max-h-full max-w-full object-contain" />
                        ) : (
                            <div className="text-6xl">🖥️</div>
                        )}
                    </div>
                </div>

                <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-2 h-12">{name}</h3>

                    <div className="flex items-center gap-1 mb-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                                key={i}
                                className={`w-4 h-4 ${
                                    i < averageRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                }`}
                            />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">({reviewCount})</span>
                    </div>

                    <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-xl font-bold text-primary">{formatVND(price)}</span>
                    </div>
                </div>
            </div>

            <div className="px-4 pb-4">
                <AddToCartButton productId={_id} name={name} price={price} image={images?.[0]?.url || images} />
            </div>
        </div>
    );
}

export default function ProductListingPage() {
    const [products, setProducts] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    // DYNAMIC DATA FROM API
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    // PAGINATION
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // SORT
    const [sortBy, setSortBy] = useState('best-match');

    // FILTERS
    const [selectedCategories, setSelectedCategories] = useState(new Set());
    const [selectedBrands, setSelectedBrands] = useState(new Set());
    const [selectedPriceRange, setSelectedPriceRange] = useState(null);
    const PRICE_RANGES = [
        { key: 'under_5', label: 'Dưới 5 triệu', min: 0, max: 5_000_000 },
        { key: '5_10', label: '5 - 10 triệu', min: 5_000_000, max: 10_000_000 },
        { key: '10_20', label: '10 - 20 triệu', min: 10_000_000, max: 20_000_000 },
        { key: '20_40', label: '20 - 40 triệu', min: 20_000_000, max: 40_000_000 },
        { key: 'over_40', label: 'Trên 40 triệu', min: 40_000_000 },
    ];
    const buildPriceQuery = () => {
        if (!selectedPriceRange) return {};

        const range = PRICE_RANGES.find((r) => r.key === selectedPriceRange);
        if (!range) return {};

        const query = {};
        if (range.min !== undefined) query.minPrice = range.min;
        if (range.max !== undefined) query.maxPrice = range.max;

        return query;
    };

    // UI
    const [expandedSections, setExpandedSections] = useState(new Set(['category']));

    // FETCH CATEGORIES AND BRANDS ON MOUNT
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [categoriesRes, brandsRes] = await Promise.all([
                    getCategories({ isActive: true }),
                    getBrands({ isActive: true }),
                ]);

                setCategories(categoriesRes.data || []);
                setBrands(brandsRes.data || []);
            } catch (err) {
                console.error('❌ Fetch filters error:', err);
            }
        };

        fetchFilters();
    }, []);

    // FETCH PRODUCTS
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const priceQuery = buildPriceQuery();
                const params = {
                    page: currentPage,
                    limit: itemsPerPage,
                    sort: sortBy,
                    category: Array.from(selectedCategories).join(','), // ✅
                    brand: Array.from(selectedBrands).join(','),
                    ...priceQuery,
                };

                const res = await getProducts(params);

                setProducts(res.data || []);
                setTotal(res.pagination?.total || 0);
                setTotalPages(res.pagination?.totalPages || 1);
            } catch (err) {
                console.error('❌ Fetch products error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [currentPage, sortBy, selectedCategories, selectedBrands, selectedPriceRange]);

    // HELPERS
    const toggleFilter = (setFn, value) => {
        setFn((prev) => {
            const next = new Set(prev);
            next.has(value) ? next.delete(value) : next.add(value);
            return next;
        });
        setCurrentPage(1); // Reset to page 1 when filter changes
    };

    const toggleSection = (section) => {
        setExpandedSections((prev) => {
            const next = new Set(prev);
            next.has(section) ? next.delete(section) : next.add(section);
            return next;
        });
    };

    const clearAllFilters = () => {
        setSelectedCategories(new Set());
        setSelectedBrands(new Set());
        setSelectedPriceRange(null);
        setCurrentPage(1);
    };

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
                            {categories.length === 0 ? (
                                <p className="text-xs text-muted-foreground pl-2">Đang tải...</p>
                            ) : (
                                categories.map((cat) => (
                                    <label
                                        key={cat._id}
                                        className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-1 rounded"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.has(cat.slug)}
                                            onChange={() => toggleFilter(setSelectedCategories, cat.slug)}
                                            className="w-4 h-4 rounded border-gray-300"
                                        />
                                        <span className="text-sm text-muted-foreground flex-1">{cat.name}</span>
                                    </label>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Price Filter */}
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
                            {PRICE_RANGES.map((range) => (
                                <label
                                    key={range.key}
                                    className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-1 rounded"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedPriceRange === range.key}
                                        onChange={() => {
                                            setSelectedPriceRange((prev) => (prev === range.key ? null : range.key));
                                            setCurrentPage(1);
                                        }}
                                        className="w-4 h-4 rounded border-gray-300"
                                    />
                                    <span className="text-sm text-muted-foreground">{range.label}</span>
                                </label>
                            ))}
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
                            {brands.length === 0 ? (
                                <p className="text-xs text-muted-foreground pl-2">Đang tải...</p>
                            ) : (
                                brands.map((brand) => (
                                    <label
                                        key={brand._id}
                                        className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-1 rounded"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedBrands.has(brand.slug)}
                                            onChange={() => toggleFilter(setSelectedBrands, brand.slug)}
                                            className="w-4 h-4 rounded border-gray-300"
                                        />
                                        <span className="text-sm text-muted-foreground">{brand.name}</span>
                                    </label>
                                ))
                            )}
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
                        <p className="text-muted-foreground">Tìm thấy {total} sản phẩm</p>
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-muted-foreground">Sắp xếp:</label>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="newest">Mới Nhất</option>
                                <option value="price_asc">Giá: Thấp đến Cao</option>
                                <option value="price_desc">Giá: Cao đến Thấp</option>
                                <option value="rating">Đánh Giá Cao</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="mb-8">
                    {loading ? (
                        <div className="text-center py-16 text-muted-foreground">Đang tải sản phẩm...</div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">😢</div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                                Không tìm thấy sản phẩm phù hợp
                            </h3>
                            <p className="text-muted-foreground">Hãy thử thay đổi bộ lọc hoặc khoảng giá khác</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <ProductCard key={product._id} {...product} />
                            ))}
                        </div>
                    )}
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
