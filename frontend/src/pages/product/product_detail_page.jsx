import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProductById, getSimilarProducts } from '../../services/product/product.api';
import { getReviewByProductId } from '../../services/review/review.api';
import { toast } from 'react-toastify';
import customizeAPI from '@/services/customizeApi';
import AddToCartButton from '@/components/customer/AddToCartButton';
export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImage, setCurrentImage] = useState(0);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [reviews, setReviews] = useState([]);

    // Fetch product data
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getProductById(id);
                setProduct(response.data);
            } catch (err) {
                console.error('Error fetching product:', err);
                setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    // Fetch similar products based on current product
    useEffect(() => {
        const fetchSimilarProducts = async () => {
            if (!product) {
                console.log('No product loaded yet');
                return;
            }

            const productId = product._id || product.id;
            if (!productId) {
                console.log('Product has no ID');
                return;
            }

            console.log('Fetching similar products for product ID:', productId);

            try {
                const response = await getSimilarProducts(productId, { limit: 4 });
                console.log('Similar products API response:', response);

                // Handle response structure { success: true, data: [...] }
                const products = response.data?.data || response.data || [];
                console.log('Similar products found:', products.length, products);
                setSimilarProducts(products);
            } catch (err) {
                console.error('Error fetching similar products:', err);
                setSimilarProducts([]);
            }
        };

        fetchSimilarProducts();
    }, [product]);

    // Fetch reviews based on current product
    useEffect(() => {
        const fetchReviews = async () => {
            if (!product) {
                return;
            }

            const productId = product._id || product.id;
            if (!productId) {
                return;
            }

            try {
                const response = await getReviewByProductId(productId);
                const reviewsData = response.data?.data || response.data || [];
                setReviews(Array.isArray(reviewsData) ? reviewsData : []);
            } catch (err) {
                console.error('Error fetching reviews:', err);
                setReviews([]);
            }
        };

        fetchReviews();
    }, [product]);

    // Product Gallery Images
    const images = [
        {
            id: 1,
            src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect fill="%23e5e5e5" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" dominantBaseline="middle" textAnchor="middle" fontFamily="sans-serif" fontSize="24" fill="%23999"%3ERTX 4090 Main View%3C/text%3E%3C/svg%3E',
            alt: 'Product main view',
        },
        {
            id: 2,
            src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect fill="%23f0f0f0" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" dominantBaseline="middle" textAnchor="middle" fontFamily="sans-serif" fontSize="24" fill="%23999"%3ETop View%3C/text%3E%3C/svg%3E',
            alt: 'Product top view',
        },
        {
            id: 3,
            src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect fill="%23e8e8e8" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" dominantBaseline="middle" textAnchor="middle" fontFamily="sans-serif" fontSize="24" fill="%23999"%3ESide View%3C/text%3E%3C/svg%3E',
            alt: 'Product side view',
        },
        {
            id: 4,
            src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect fill="%23ececec" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" dominantBaseline="middle" textAnchor="middle" fontFamily="sans-serif" fontSize="24" fill="%23999"%3EConnectors%3C/text%3E%3C/svg%3E',
            alt: 'Product connectors',
        },
    ];

    // Get specifications from product.specifications.detail_json
    // This is the ONLY source for displaying technical specifications
    const getSpecifications = () => {
        if (!product?.specifications?.detail_json) {
            return [];
        }

        const detailJson = product.specifications.detail_json;

        // Convert detail_json object to array of { title, value } pairs
        return Object.entries(detailJson).map(([key, value]) => ({
            title: formatSpecTitle(key),
            value: formatSpecValue(value),
        }));
    };

    // Format specification key to readable title
    const formatSpecTitle = (key) => {
        return key
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Format specification value
    const formatSpecValue = (value) => {
        if (value === null || value === undefined) return 'N/A';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    };

    const specifications = getSpecifications();



    // Customer Reviews Data
   

    // Hàm test add to cart
    // add to cart
    const handleAddToCart = async () => {
        console.log('Adding to cart by dan:', id);
        try {
            const response = await customizeAPI.post(
                '/cart/add',
                {
                    productId: '69781f14a989906b4c9c0846',
                    quantity: 1,
                },
                {
                    withCredentials: true,
                },
            );
            console.log(response.data);
            toast.success('Thêm vào giỏ hàng thành công!');
        } catch (error) {
            // toast lỗi 401
            // if (error.response && error.response.status === 401) {
            //     toast.error('Bé yêu vui lòng đăng nhập để sử dụng dịch vụ này nhé!');
            // }
            // // toast lỗi 403
            // else if (error.response && error.response.status === 403) {
            //     toast.error('Bé yêu không có quyền thực hiện hành động này nhé!');
            // }
            console.error('Error adding to cart:', error);
        }
    };

    ///

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải thông tin sản phẩm...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    // No product found
    if (!product) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Không tìm thấy sản phẩm.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Main Product Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Product Gallery */}
                    <div>
                        {/* Main Image */}
                        <div className="relative bg-gray-100 rounded mb-4 aspect-square overflow-hidden group">
                            <div
                                className="w-full h-full flex items-center justify-center"
                                style={{
                                    backgroundImage: `url(${images[currentImage].src})`,
                                    backgroundSize: 'contain',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'center',
                                }}
                            />

                            {/* Navigation Arrows */}
                            <button
                                onClick={() => setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-900" />
                            </button>
                            <button
                                onClick={() => setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition"
                            >
                                <ChevronRight className="w-5 h-5 text-gray-900" />
                            </button>
                        </div>

                        {/* Thumbnail Images */}
                        <div className="grid grid-cols-4 gap-3">
                            {images.map((image, index) => (
                                <button
                                    key={image.id}
                                    onClick={() => setCurrentImage(index)}
                                    className={`relative aspect-square rounded overflow-hidden border-2 transition ${
                                        currentImage === index ? 'border-blue-600' : 'border-gray-200'
                                    }`}
                                >
                                    <div
                                        className="w-full h-full"
                                        style={{
                                            backgroundImage: `url(${image.src})`,
                                            backgroundSize: 'contain',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'center',
                                            backgroundColor: '#f5f5f5',
                                        }}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name || 'Tên sản phẩm'}</h1>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex items-center gap-1">
                                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-semibold text-gray-900">
                                    {product.averageRating || '0'}
                                </span>
                                <span className="text-sm text-gray-600">({product.reviewCount || 0} đánh giá)</span>
                            </div>
                            <span className="text-sm text-green-600 font-semibold">Còn hàng</span>
                        </div>

                        {/* Price */}
                        <div className="mb-6">
                            <div className="text-4xl font-bold text-gray-900">
                                {product.price ? `${product.price.toLocaleString('vi-VN')} ₫` : 'Liên hệ'}
                            </div>
                            {product.originalPrice && product.originalPrice > product.price && (
                                <div className="text-sm text-gray-600 mt-2">
                                    <span className="line-through">
                                        {product.originalPrice.toLocaleString('vi-VN')} ₫
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Key Specs */}
                        <div className="space-y-2 mb-6 pb-6 border-b border-gray-200">
                            {product.brand && (
                                <div className="grid grid-cols-[140px_1fr] items-center">
                                    <span className="text-sm text-gray-600">Hãng sản xuất:</span>
                                    <span className="text-sm font-semibold text-gray-900">{product.brand.name}</span>
                                </div>
                            )}
                            {product.category && (
                                <div className="grid grid-cols-[140px_1fr] items-center">
                                    <span className="text-sm text-gray-600">Danh mục:</span>
                                    <span className="text-sm font-semibold text-gray-900">{product.category.name}</span>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                       <div className="px-4 pb-4">
                <AddToCartButton productId={id} name={name} price={product.price} image={product.images?.[0]?.url || images} />
            </div>
                    </div>
                </div>
            </section>

            {/* Tabs Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="border-t border-gray-200 pt-8">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">MÔ TẢ SẢN PHẨM</h2>
                        <p className="text-gray-600 leading-relaxed">
                            {product.description || 'Chưa có mô tả cho sản phẩm này.'}
                        </p>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">THÔNG SỐ KỸ THUẬT</h2>
                        {specifications.length === 0 ? (
                            <p className="text-gray-600 py-4">Chưa có thông số kỹ thuật chi tiết cho sản phẩm này.</p>
                        ) : (
                            <div className="space-y-1">
                                {specifications.map((spec, index) => (
                                    <div
                                        key={index}
                                        className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 px-2 rounded transition"
                                    >
                                        <span className="text-sm text-gray-600 font-medium">{spec.title}</span>
                                        <span className="text-sm font-semibold text-gray-900">{spec.value}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">ĐÁNH GIÁ VÀ BÌNH LUẬN</h2>
                        <div className="bg-gray-100 rounded p-6 mb-6">
                            <div className="flex items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Star className="w-7 h-7 fill-yellow-400 text-yellow-400" />
                                        <span className="text-lg font-bold text-gray-900">
                                            {product.averageRating || '0'}
                                        </span>
                                        <span className="text-lg text-gray-400">/5</span>
                                        <span className="text-base text-gray-600">
                                            ({product.reviewCount || 0} đánh giá)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reviews */}
                        <div className="space-y-4">
                            {reviews.length === 0 ? (
                                <p className="text-gray-600 py-4">Chưa có đánh giá nào cho sản phẩm này.</p>
                            ) : (
                                reviews.map((review) => (
                                    <div
                                        key={review._id}
                                        className="border border-gray-200 rounded p-4 hover:bg-gray-50 transition"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                                                {review.userId?.fullName?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {review.userId?.fullName || 'Anonymous'}
                                                </p>
                                                <div className="flex gap-0.5">
                                                    {[...Array(review.rating)].map((_, j) => (
                                                        <Star
                                                            key={j}
                                                            className="w-3 h-3 fill-yellow-400 text-yellow-400"
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600">{review.comment}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Similar Products */}
            {similarProducts.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Sản phẩm tương tự</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {similarProducts.map((similarProduct) => (
                            <div
                                key={similarProduct._id || similarProduct.id}
                                className="border border-gray-200 rounded overflow-hidden hover:shadow-lg transition cursor-pointer"
                                onClick={() => {
                                    const productId = similarProduct._id || similarProduct.id;
                                    navigate(`/product/${productId}`);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                            >
                                {/* Product Image */}
                                <div className="aspect-square bg-gray-100 overflow-hidden">
                                    <div
                                        className="w-full h-full"
                                        style={{
                                            backgroundImage: `url(${
                                                similarProduct.imageUrl ||
                                                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominantBaseline="middle" textAnchor="middle" fontFamily="sans-serif" fontSize="12" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E'
                                            })`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                        }}
                                    />
                                </div>

                                {/* Product Info */}
                                <div className="p-4">
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                        {similarProduct.name}
                                    </p>
                                    <p className="text-lg font-bold text-blue-600 mt-2">
                                        {similarProduct.price
                                            ? `${similarProduct.price.toLocaleString('vi-VN')} ₫`
                                            : 'Liên hệ'}
                                    </p>
                                    <button
                                        className="w-full mt-3 py-2 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700 transition"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Add to cart logic here
                                        }}
                                    >
                                        Thêm vào giỏ
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
