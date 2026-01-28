import { useState } from 'react';
import { Star, ShoppingCart, Eye, RotateCw, Zap, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductDetailPage() {
    const [currentImage, setCurrentImage] = useState(0);

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

    // Product Specs
    const specs = [
        { label: 'Hãng sản xuất:', value: 'ASUS' },
        { label: 'Sản phẩm:', value: 'VGA' },
        { label: 'Bảo hành:', value: '36 Tháng' },
    ];

    // Detailed Specifications
    const specifications = [
        { title: 'Architecture', value: 'Ada' },
        { title: 'Memory Boost', value: 'Smart Boost' },
        { title: 'PCI Express', value: 'PCI-E 4.0' },
        { title: 'System Interface', value: '384-bit' },
        { title: 'Cooling Solution', value: 'Vapor Chamber' },
        { title: 'Cooler Noise', value: 'Low Noise' },
    ];

    // Customer Reviews Data
    const reviews = [
        {
            name: 'Alex Johnson',
            rating: 5,
            title: 'Best GPU for gaming',
            comment:
                'The RTX 4090 completely transformed my gaming experience. Runs all games at max settings with incredible performance.',
        },
        {
            name: 'Sarah Chen',
            rating: 5,
            title: 'Excellent for content creation',
            comment:
                'Amazing GPU for 3D rendering and video editing. The performance increase is noticeable compared to previous gen.',
        },
        {
            name: 'Mike Rodriguez',
            rating: 4,
            title: 'Great but expensive',
            comment:
                'Fantastic performance but the price tag is quite high. Worth it if you need top-tier performance.',
        },
    ];

    // Related Products
    const products = [
        {
            id: 1,
            name: 'Power Supply 850W Gold',
            price: '$129.99',
            image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominantBaseline="middle" textAnchor="middle" fontFamily="sans-serif" fontSize="12" fill="%23999"%3EPower Supply%3C/text%3E%3C/svg%3E',
        },
        {
            id: 2,
            name: 'GPU Cooling Fan',
            price: '$49.99',
            image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23e8e8e8" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominantBaseline="middle" textAnchor="middle" fontFamily="sans-serif" fontSize="12" fill="%23999"%3ECooling Fan%3C/text%3E%3C/svg%3E',
        },
        {
            id: 3,
            name: 'Gaming Case RGB',
            price: '$159.99',
            image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23ececec" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominantBaseline="middle" textAnchor="middle" fontFamily="sans-serif" fontSize="12" fill="%23999"%3EGaming Case%3C/text%3E%3C/svg%3E',
        },
        {
            id: 4,
            name: 'Motherboard X870E',
            price: '$349.99',
            image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23f5f5f5" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominantBaseline="middle" textAnchor="middle" fontFamily="sans-serif" fontSize="12" fill="%23999"%3EMotherboard%3C/text%3E%3C/svg%3E',
        },
    ];

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
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">GeForce RTX 4090 Founders Edition</h1>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex items-center gap-1">
                                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-semibold text-gray-900">4.8</span>
                                <span className="text-sm text-gray-600">(324 đánh giá)</span>
                            </div>
                            <span className="text-sm text-green-600 font-semibold">Còn hàng</span>
                        </div>

                        {/* Price */}
                        <div className="mb-6">
                            <div className="text-4xl font-bold text-gray-900">$1,599.99</div>
                            <div className="text-sm text-gray-600 mt-2">
                                <span className="line-through">$1,999.99</span>
                            </div>
                        </div>

                        {/* Key Specs */}
                        <div className="space-y-2 mb-6 pb-6 border-b border-gray-200">
                            {specs.map((spec, index) => (
                                <div key={index} className="grid grid-cols-[140px_1fr] items-center">
                                    <span className="text-sm text-gray-600">{spec.label}</span>
                                    <span className="text-sm font-semibold text-gray-900">{spec.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 mb-6">
                            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12 font-semibold rounded flex items-center justify-center">
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Thêm vào giỏ hàng
                            </button>
                        </div>

                        {/* Quick Actions
                        <div className="grid grid-cols-3 gap-3">
                            <button className="border border-gray-200 rounded p-3 text-center hover:bg-gray-50 transition">
                                <Eye className="w-4 h-4 mx-auto mb-2" />
                                <span className="text-xs font-semibold text-gray-900">Quick View</span>
                            </button>
                            <button className="border border-gray-200 rounded p-3 text-center hover:bg-gray-50 transition">
                                <RotateCw className="w-4 h-4 mx-auto mb-2" />
                                <span className="text-xs font-semibold text-gray-900">Compare</span>
                            </button>
                            <button className="border border-gray-200 rounded p-3 text-center hover:bg-gray-50 transition">
                                <Zap className="w-4 h-4 mx-auto mb-2" />
                                <span className="text-xs font-semibold text-gray-900">Notify Me</span>
                            </button>
                        </div> */}
                    </div>
                </div>
            </section>

            {/* Tabs Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="border-t border-gray-200 pt-8">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">MÔ TẢ SẢN PHẨM</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Trải nghiệm hiệu năng chơi game thế hệ mới với NVIDIA GeForce RTX 4090 Founders Edition.
                            Được thiết kế để đạt hiệu năng tối đa, GPU hàng đầu này mang đến khả năng chơi game và sáng
                            tạo vượt trội. Với 16.384 lõi CUDA và công nghệ dò tia tiên tiến, hãy tận hưởng trải nghiệm
                            chơi game sống động ở cài đặt đồ họa cao nhất. Thiết kế tản nhiệt tiên tiến đảm bảo hiệu
                            năng tối ưu ngay cả khi xử lý các tác vụ nặng.
                        </p>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">THÔNG SỐ KỸ THUẬT</h2>
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
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">ĐÁNH GIÁ VÀ BÌNH LUẬN</h2>
                        <div className="bg-gray-100 rounded p-6 mb-6">
                            <div className="flex items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-1 mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">4.8</p>
                                    <p className="text-sm text-gray-600">Based on 324 reviews</p>
                                </div>
                            </div>
                        </div>

                        {/* Sample Reviews */}
                        <div className="space-y-4">
                            {reviews.map((review, i) => (
                                <div key={i} className="border border-gray-200 rounded p-4 hover:bg-gray-50 transition">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                                            {review.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{review.name}</p>
                                            <div className="flex gap-0.5">
                                                {[...Array(review.rating)].map((_, j) => (
                                                    <Star key={j} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 mb-1">{review.title}</p>
                                    <p className="text-sm text-gray-600">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Compatible Components */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Sản phẩm khác</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="border border-gray-200 rounded overflow-hidden hover:shadow-lg transition cursor-pointer"
                        >
                            {/* Product Image */}
                            <div className="aspect-square bg-gray-100 overflow-hidden">
                                <div
                                    className="w-full h-full"
                                    style={{
                                        backgroundImage: `url(${product.image})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                    }}
                                />
                            </div>

                            {/* Product Info */}
                            <div className="p-4">
                                <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                                <p className="text-lg font-bold text-blue-600 mt-2">{product.price}</p>
                                <button className="w-full mt-3 py-2 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700 transition">
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
