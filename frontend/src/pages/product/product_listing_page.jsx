import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { getProducts } from '@/services/product/product.api';
import { getCategories } from '@/services/category/category.api';
import { getBrands } from '@/services/brand/brand.api';
import AddToCartButton from '@/components/customer/AddToCartButton';

// ============================================
// 📌 CONSTANTS - Các hằng số cố định
// ============================================
const ITEMS_PER_PAGE = 6;

const PRICE_RANGES = [
    { key: 'under_5', label: 'Dưới 5 triệu', min: 0, max: 5_000_000 },
    { key: '5_10', label: '5 - 10 triệu', min: 5_000_000, max: 10_000_000 },
    { key: '10_20', label: '10 - 20 triệu', min: 10_000_000, max: 20_000_000 },
    { key: '20_40', label: '20 - 40 triệu', min: 20_000_000, max: 40_000_000 },
    { key: 'over_40', label: 'Trên 40 triệu', min: 40_000_000 },
];

// ============================================
// 🛠️ HELPER FUNCTIONS - Các hàm tiện ích
// ============================================

// Format số tiền sang VND
const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
};

// Xây dựng query cho khoảng giá
const buildPriceQuery = (selectedPriceRange) => {
    if (!selectedPriceRange) return {};

    const range = PRICE_RANGES.find((r) => r.key === selectedPriceRange);
    if (!range) return {};

    const query = {};
    if (range.min !== undefined) query.minPrice = range.min;
    if (range.max !== undefined) query.maxPrice = range.max;

    return query;
};

// ============================================
// PRODUCT CARD COMPONENT
// ============================================
function ProductCard({ _id, name, price, averageRating, reviewCount, images, stock, productType }) {
    const navigate = useNavigate();

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
            {/* Phần ảnh và thông tin - Click để xem chi tiết */}
            <div onClick={() => navigate(`/product/${_id}`)} className="cursor-pointer">
                {/* Ảnh sản phẩm */}
                <div className="relative bg-muted p-6">
                    <div className="relative bg-muted p-6 flex items-center justify-center h-48">
                        {images ? (
                            <img src={images} alt={name} className="max-h-full max-w-full object-contain" />
                        ) : (
                            <div className="text-6xl">🖥️</div>
                        )}
                    </div>
                </div>

                {/* Thông tin sản phẩm */}
                <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-2 h-12">{name}</h3>

                    {/* Đánh giá sao */}
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

                    {/* Giá */}
                    <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-xl font-bold text-primary">{formatVND(price)}</span>
                    </div>
                </div>
            </div>

            {/* Nút thêm vào giỏ hàng */}
            <div className="px-4 pb-4">
                {stock > 0 ? (
                    <AddToCartButton
                        productId={_id}
                        productType={productType}
                        name={name}
                        price={price}
                        image={images?.[0]?.url || images}
                    />
                ) : (
                    <div className="text-center text-sm text-red-500 font-medium">Hết hàng</div>
                )}
            </div>
        </div>
    );
}

// ============================================
// MAIN COMPONENT - ProductListingPage
// ============================================
export default function ProductListingPage() {
    // --- STATE: từ URL ---
    const [searchParams] = useSearchParams();
    // Lấy category và keyword từ URL
    const categoryFromUrl = searchParams.get('category');
    const keywordFromUrl = searchParams.get('keyword');

    // --- STATE: Dữ liệu sản phẩm ---
    const [products, setProducts] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    // --- STATE: Dữ liệu filter từ API ---
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    // --- STATE: Phân trang ---
    const [currentPage, setCurrentPage] = useState(1);

    // --- STATE: Sắp xếp ---
    const [sortBy, setSortBy] = useState('best-match');

    // --- STATE: Bộ lọc ---
    const [selectedCategories, setSelectedCategories] = useState(
        new Set(categoryFromUrl ? categoryFromUrl.split(',') : []),
    );
    const [selectedBrands, setSelectedBrands] = useState(new Set());
    const [selectedPriceRange, setSelectedPriceRange] = useState(null);

    // --- STATE: UI (mở/đóng các section filter) ---
    const [expandedSections, setExpandedSections] = useState(new Set(['category']));

    // ============================================
    // EFFECT: Lấy danh sách categories và brands khi component mount
    // ============================================
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
                console.error('❌ Lỗi khi tải bộ lọc:', err);
            }
        };

        fetchFilters();
    }, []);

    // ============================================
    // EFFECT: Lấy danh sách sản phẩm khi filter/sort/page/keyword thay đổi
    // ============================================
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // Xây dựng params để gửi lên API
                const priceQuery = buildPriceQuery(selectedPriceRange);
                const params = {
                    page: currentPage,
                    limit: ITEMS_PER_PAGE,
                    sort: sortBy,
                    category: Array.from(selectedCategories).join(','),
                    brand: Array.from(selectedBrands).join(','),
                    keyword: keywordFromUrl || undefined,
                    ...priceQuery,
                };

                const res = await getProducts(params);

                setProducts(res.data || []);
                setTotal(res.pagination?.total || 0);
                setTotalPages(res.pagination?.totalPages || 1);
            } catch (err) {
                console.error('❌ Lỗi khi tải sản phẩm:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [currentPage, sortBy, selectedCategories, selectedBrands, selectedPriceRange, keywordFromUrl]);

    // Reset trang 1 khi keyword thay đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [keywordFromUrl]);

    // ============================================
    // HANDLERS - Các hàm xử lý sự kiện
    // ============================================

    // Bật/tắt filter (category, brand)
    const toggleFilter = (setFn, value) => {
        setFn((prev) => {
            const next = new Set(prev);
            next.has(value) ? next.delete(value) : next.add(value);
            return next;
        });
        setCurrentPage(1); // Reset về trang 1 khi thay đổi filter
    };

    // Mở/đóng section filter
    const toggleSection = (section) => {
        setExpandedSections((prev) => {
            const next = new Set(prev);
            next.has(section) ? next.delete(section) : next.add(section);
            return next;
        });
    };

    // Xóa tất cả filter
    const clearAllFilters = () => {
        setSelectedCategories(new Set());
        setSelectedBrands(new Set());
        setSelectedPriceRange(null);
        setCurrentPage(1);
    };

    // Chuyển trang
    const goToPage = (page) => {
        setCurrentPage(page);
    };

    const goToPreviousPage = () => {
        setCurrentPage((p) => Math.max(1, p - 1));
    };

    const goToNextPage = () => {
        setCurrentPage((p) => Math.min(totalPages, p + 1));
    };

    // ============================================
    //  RENDER HELPERS - Các hàm render UI
    // ============================================

    // Render 1 section filter (có thể mở/đóng)
    const renderFilterSection = (sectionKey, title, content) => (
        <div className="mb-4">
            <button
                onClick={() => toggleSection(sectionKey)}
                className="w-full flex items-center justify-between py-2 hover:bg-sidebar-accent/30 rounded-lg px-2 transition"
            >
                <span className="font-medium text-foreground">{title}</span>
                {expandedSections.has(sectionKey) ? (
                    <ChevronDown className="w-4 h-4" />
                ) : (
                    <ChevronRight className="w-4 h-4" />
                )}
            </button>
            {expandedSections.has(sectionKey) && <div className="mt-2 space-y-2 pl-2">{content}</div>}
        </div>
    );

    // Render danh sách categories
    const renderCategoryFilter = () => {
        if (categories.length === 0) {
            return <p className="text-xs text-muted-foreground pl-2">Đang tải...</p>;
        }

        return categories.map((cat) => (
            <label key={cat._id} className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-1 rounded">
                <input
                    type="checkbox"
                    checked={selectedCategories.has(cat.slug)}
                    onChange={() => toggleFilter(setSelectedCategories, cat.slug)}
                    className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm text-muted-foreground flex-1">{cat.name}</span>
            </label>
        ));
    };

    // Render danh sách khoảng giá
    const renderPriceFilter = () => {
        return PRICE_RANGES.map((range) => (
            <label key={range.key} className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-1 rounded">
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
        ));
    };

    // Render danh sách brands
    const renderBrandFilter = () => {
        if (brands.length === 0) {
            return <p className="text-xs text-muted-foreground pl-2">Đang tải...</p>;
        }

        return brands.map((brand) => (
            <label key={brand._id} className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-1 rounded">
                <input
                    type="checkbox"
                    checked={selectedBrands.has(brand.slug)}
                    onChange={() => toggleFilter(setSelectedBrands, brand.slug)}
                    className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm text-muted-foreground">{brand.name}</span>
            </label>
        ));
    };

    // ============================================
    // RENDER MAIN UI
    // ============================================
    return (
        <div className="flex min-h-screen bg-background">
            {/* ========== SIDEBAR - BỘ LỌC ========== */}
            <aside className="w-72 border-r border-border bg-card p-6 overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">Bộ Lọc</h2>
                    <button onClick={clearAllFilters} className="text-sm text-primary hover:underline">
                        Xóa Tất Cả
                    </button>
                </div>

                {/* Các bộ lọc */}
                {renderFilterSection('category', 'Danh Mục', renderCategoryFilter())}
                {renderFilterSection('price', 'Khoảng Giá', renderPriceFilter())}
                {renderFilterSection('brand', 'Thương Hiệu', renderBrandFilter())}
            </aside>

            {/* ========== MAIN CONTENT - DANH SÁCH SẢN PHẨM ========== */}
            <main className="flex-1 p-8">
                {/* Header - Tiêu đề và sắp xếp */}
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

                {/* Danh sách sản phẩm */}
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

                {/* Phân trang */}
                <div className="flex justify-center items-center gap-2">
                    {/* Nút Previous */}
                    <button
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-border hover:bg- disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Các số trang */}
                    {Array.from({ length: totalPages }).map((_, i) => {
                        const page = i + 1;
                        const isFirstPage = page === 1;
                        const isLastPage = page === totalPages;
                        const isNearCurrentPage = page >= currentPage - 1 && page <= currentPage + 1;

                        // Hiển thị: trang đầu, trang cuối, và các trang gần trang hiện tại
                        if (isFirstPage || isLastPage || isNearCurrentPage) {
                            return (
                                <button
                                    key={page}
                                    onClick={() => goToPage(page)}
                                    className={`w-10 h-10 rounded-lg font-medium transition ${
                                        currentPage === page
                                            ? 'bg-primary text-primary-foreground'
                                            : 'border border-border hover:bg-secondary text-foreground'
                                    }`}
                                >
                                    {page}
                                </button>
                            );
                        }
                        // Hiển thị dấu "..." giữa các trang
                        else if (
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

                    {/* Nút Next */}
                    <button
                        onClick={goToNextPage}
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
