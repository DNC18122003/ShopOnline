import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { getProductById, getSimilarProducts } from '../../services/product/product.api';
import { getReviewsByProduct } from '../../services/order/review.api';
import { toast } from 'react-toastify';
import customizeAPI from '@/services/customizeApi';
import AddToCartButton from '@/components/customer/AddToCartButton';
import commentService from '@/services/comment/comment.api';
import ProductReviewList from './ProductReviewList';

// ============================================
// HELPER FUNCTIONS - Các hàm tiện ích
// ============================================
// Format tiêu đề specification từ key (vd: "ram_capacity" -> "Ram Capacity")
const formatSpecTitle = (key) => {
    return key
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

// Format giá trị specification
const formatSpecValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
};

// Lấy danh sách specifications từ product.specifications.detail_json
const getSpecifications = (product) => {
    if (!product?.specifications?.detail_json) {
        return [];
    }

    const detailJson = product.specifications.detail_json;

    // Chuyển đổi object thành array của { title, value }
    return Object.entries(detailJson).map(([key, value]) => ({
        title: formatSpecTitle(key),
        value: formatSpecValue(value),
    }));
};

// Lấy danh sách ảnh từ product.images
const getProductImages = (product) => {
    // Nếu không có product hoặc không có images, trả về mảng rỗng
    if (!product?.images || !Array.isArray(product.images) || product.images.length === 0) {
        return [];
    }

    // product.images là array of strings (URLs), chuyển đổi thành format phù hợp
    return product.images.map((imageUrl, index) => ({
        id: index,
        src: imageUrl, // imageUrl là string URL trực tiếp
        alt: `${product.name}`,
    }));
};

// ============================================
// MAIN COMPONENT - ProductDetailPage
// ============================================

export default function ProductDetailPage() {
    const { id } = useParams();
    console.log('ID nhận được là:', id);
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [showAllSpecs, setShowAllSpecs] = useState(false);
    const [comments, setComments] = useState([]);
    const [question, setQuestion] = useState('');
    const [replyContent, setReplyContent] = useState({});
    const [replyOpenId, setReplyOpenId] = useState(null);

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
                const response = await getReviewsByProduct(productId);
                const reviewsData = response.data?.data || response.data || [];
                setReviews(Array.isArray(reviewsData) ? reviewsData : []);
            } catch (err) {
                console.error('Error fetching reviews:', err);
                setReviews([]);
            }
        };

        fetchReviews();
    }, [product]);
    // Thêm useEffect gọi API Comment
    useEffect(() => {
        const fetchComments = async () => {
            if (!product) {
                return;
            }
            const productId = product._id || product.id;
            if (!productId) {
                return;
            }
            try {
                const response = await commentService.getCommentsByProductId(productId);
                const commentsData = response.data?.data || response.data || [];
                setComments(Array.isArray(commentsData) ? commentsData : []);
            } catch (err) {
                console.error('Error fetching reviews:', err);
            }
        };
        fetchComments();
    }, [product]);

    const handleReplyChange = (commentId, value) => {
        setReplyContent((prev) => ({ ...prev, [commentId]: value }));
    };
    const submitReply = async (commentId) => {
        // Gọi API lưu reply vào database với parentId là commentId
        // Sau khi thành công, nhớ refresh lại danh sách comments
        console.log('Gửi phản hồi:', replyContent[commentId], 'cho comment:', commentId);
    };
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

    // Điều hướng đến sản phẩm tương tự
    const navigateToProduct = (productId) => {
        navigate(`/product/${productId}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const handleBuyNow = () => {
        if (!product) return;

        navigate('/checkout', {
            state: {
                buyNowItem: {
                    productId: product._id,
                    nameSnapshot: product.name,
                    priceSnapshot: product.price,
                    imageSnapshot: product.images?.[0] || '',
                    quantity: 1,
                },
            },
        });
    };

    // ============================================
    // COMPUTED VALUES - Các giá trị tính toán
    // ============================================
    const specifications = getSpecifications(product);
    const productImages = getProductImages(product)[0];

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
            {/* ========== PRODUCT GALLERY & INFO ========== */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Gallery ảnh sản phẩm */}
                    <div className="relative bg-gray-100 rounded mb-4 aspect-square overflow-hidden flex items-center justify-center">
                        {productImages?.src ? (
                            <div
                                className="w-full h-full"
                                style={{
                                    backgroundImage: `url(${productImages.src})`,
                                    backgroundSize: 'contain',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'center',
                                }}
                            />
                        ) : (
                            <span className="max-h-full max-w-full object-contain">
                                {productImages?.alt || 'Không có hình ảnh'}
                            </span>
                        )}
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
                            {product.stock > 0 ? (
                                <span className="text-sm text-green-600 font-semibold">
                                    Còn hàng ({product.stock} sản phẩm)
                                </span>
                            ) : (
                                <span className="text-sm text-red-600 font-semibold">Hết hàng</span>
                            )}
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
                        <div className="px-4 pb-4 space-y-3">
                            {product.stock > 0 ? (
                                <>
                                    <AddToCartButton
                                        productId={product._id}
                                        name={product.name}
                                        price={product.price}
                                        image={product.images?.[0]}
                                    />

                                    <button
                                        onClick={() => handleBuyNow()}
                                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition"
                                    >
                                        Mua ngay
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="text-center text-sm text-red-500 font-medium">
                                        Sản phẩm này sẽ được cửa hàng bổ sung sớm !
                                    </div>

                                    <button
                                        disabled
                                        className="w-full bg-gray-300 text-gray-500 py-3 rounded-lg font-semibold cursor-not-allowed"
                                    >
                                        Mua ngay
                                    </button>
                                </>
                            )}
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
                            <>
                                <div className="space-y-1">
                                    {(showAllSpecs ? specifications : specifications.slice(0, 5)).map((spec, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 px-2 rounded transition"
                                        >
                                            <span className="text-sm text-gray-600 font-medium">{spec.title}</span>
                                            <span className="text-sm font-semibold text-gray-900">{spec.value}</span>
                                        </div>
                                    ))}
                                </div>
                                {specifications.length > 5 && (
                                    <button
                                        onClick={() => setShowAllSpecs(!showAllSpecs)}
                                        className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors"
                                    >
                                        {showAllSpecs ? (
                                            <>
                                                <ChevronUp className="w-4 h-4" />
                                                Thu gọn
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="w-4 h-4" />
                                                Xem cấu hình chi tiết ({specifications.length - 5} thông số còn lại)
                                            </>
                                        )}
                                    </button>
                                )}
                            </>
                        )}
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">ĐÁNH GIÁ {product.name}</h2>

                        <ProductReviewList productId={id} />
                    </div>
                </div>
                {/* ========== PHẦN HỎI ĐÁP ========== */}
            </section>
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-100">
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                    <h2 className="text-xl font-bold mb-6 text-gray-900 uppercase">Hỏi và đáp</h2>

                    {/* Khung nhập câu hỏi */}
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-8">
                        <div className="flex gap-4 items-start">
                            <div className="flex-1">
                                <p className="text-sm font-bold text-gray-800 mb-3">
                                    Bạn có thắc mắc gì về sản phẩm? Hãy đặt câu hỏi ngay!
                                </p>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="text"
                                        value={question}
                                        onChange={(e) => setQuestion(e.target.value)}
                                        placeholder="Nhập nội dung câu hỏi "
                                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                                    />
                                    <button
                                        onClick={() => {
                                            if (question.length < 10) return toast.warning('Câu hỏi quá ngắn!');
                                            toast.info('Tính năng gửi câu hỏi đang được xử lý...');
                                        }}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-md"
                                    >
                                        GỬI CÂU HỎI
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Danh sách các câu hỏi */}
                    <div className="space-y-6">
                        {comments.length > 0 ? (
                            comments.map((comment) => (
                                <div
                                    key={comment._id}
                                    className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm"
                                >
                                    {/* Nội dung người dùng hỏi */}
                                    <div className="flex gap-3 items-start mb-4">
                                        <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                                            {comment.userId?.userName?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-gray-900 text-sm">
                                                    {comment.userId?.userName}
                                                </span>
                                                <span className="text-[11px] text-gray-400 italic">
                                                    {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
                                        </div>
                                    </div>
                                    {/* Phản hồi */}
                                    {comment.replies &&
                                        comment.replies.map((reply) => (
                                            <div
                                                key={reply._id}
                                                className="ml-10 bg-gray-50 border border-gray-200 rounded-lg p-4 relative mt-2"
                                            >
                                                {/* Mũi tên trỏ lên */}
                                                <div className="absolute -top-2 left-4 w-4 h-4 bg-gray-50 border-t border-l border-gray-200 rotate-45"></div>

                                                <div className="flex gap-3 items-start">
                                                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                                                        {comment.userId?.userName?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-bold text-gray-900 text-sm">
                                                                {reply.userId?.userName}
                                                            </span>
                                                            {reply.userId?.role === 'sale' && (
                                                                <span className="bg-blue-600 text-[9px] text-white px-1 rounded font-bold uppercase">
                                                                    Quản trị viên
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-600 leading-relaxed">
                                                            {reply.content}
                                                        </p>
                                                        <div className="mt-2 text-[11px] text-gray-400">
                                                            Trả lời lúc:{' '}
                                                            {new Date(reply.createdAt).toLocaleTimeString('vi-VN')} -{' '}
                                                            {new Date(reply.createdAt).toLocaleDateString('vi-VN')}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-2 ml-10">
                                                    <button
                                                        onClick={() => setReplyOpenId(reply._id)}
                                                        className="text-blue-600 text-sm font-semibold hover:underline"
                                                    >
                                                        Phản hồi
                                                    </button>

                                                    {replyOpenId === reply._id && (
                                                        <div className="flex gap-2 mt-2">
                                                            <input
                                                                type="text"
                                                                placeholder="Viết phản hồi..."
                                                                className="flex-1 text-sm border border-gray-200 rounded-full px-4 py-2 outline-none focus:border-blue-500"
                                                                value={replyContent[reply._id] || ''}
                                                                onChange={(e) =>
                                                                    handleReplyChange(reply._id, e.target.value)
                                                                }
                                                            />
                                                            <button
                                                                onClick={() => submitReply(reply._id)}
                                                                className="text-blue-600 font-bold text-sm hover:underline"
                                                            >
                                                                Gửi
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-400 italic text-sm">
                                    Sản phẩm này chưa có câu hỏi nào. Hãy là người đầu tiên thắc mắc!
                                </p>
                            </div>
                        )}
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
                                {/* Ảnh sản phẩm */}
                                <div className="aspect-square bg-gray-100 overflow-hidden flex items-center justify-center">
                                    {similarProduct.images?.[0] ? (
                                        <div
                                            className="w-full h-full"
                                            style={{
                                                backgroundImage: `url(${similarProduct.images[0]})`,
                                                backgroundSize: 'contain',
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'center',
                                            }}
                                        />
                                    ) : (
                                        <span className="text-gray-400 text-sm">Không có ảnh</span>
                                    )}
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
                                    <div onClick={(e) => e.stopPropagation()}>
                                      
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
