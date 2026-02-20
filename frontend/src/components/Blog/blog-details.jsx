import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button' // Đảm bảo bạn đã có component này hoặc thay bằng thẻ <button> thường

// --- Dữ liệu mẫu ---
const promoData = {
  title: 'MÃ 999D DEAL SẮT SÀN - NGÀN DEAL 99K',
  startDate: '06/02',
  endDate: '14/02/2026',
  products: [
    {
      id: '1',
      name: 'Bàn Asus Office',
      originalPrice: 280000,
      discountedPrice: 190000,
      discount: 32,
      image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=300&h=300&fit=crop',
      rating: 5,
      reviews: 12,
    },
    {
      id: '2',
      name: 'Bàn phím AKKO STORY Plus Hatsuné Miku...',
      originalPrice: 3200000,
      discountedPrice: 2480000,
      discount: 16,
      image: 'https://images.unsplash.com/photo-1587829191301-b8b0b7a4c67d?w=300&h=300&fit=crop',
      rating: 5,
      reviews: 8,
    },
    {
      id: '3',
      name: 'Bàn phím AKKO STORY Antique Jade V3 Pu...',
      originalPrice: 3000000,
      discountedPrice: 2850000,
      discount: 5,
      image: 'https://images.unsplash.com/photo-1595225476933-0efde8fb9e1e?w=300&h=300&fit=crop',
      rating: 5,
      reviews: 4,
    },
    {
      id: '4',
      name: 'Bàn phím AKKO RGB GATERON TM (Mờng lạc...',
      originalPrice: 2890000,
      discountedPrice: 2490000,
      discount: 13,
      image: 'https://images.unsplash.com/photo-1587613865266-f07df8671cf1?w=300&h=300&fit=crop',
      rating: 5,
      reviews: 6,
    },
  ],
}

// --- Component Section Khuyến Mãi ---
export function BlogPromoSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 18, seconds: 23, days: 4 })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 }
        return prev
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? promoData.products.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === promoData.products.length - 1 ? 0 : prev + 1))
  }

  return (
    <section className="bg-red-600 text-white rounded-lg overflow-hidden mb-8">
      {/* Header */}
      <div className="bg-red-700 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">🔥 {promoData.title}</h2>
          <div className="flex gap-2">
            <div className="bg-red-800 rounded px-2 py-1 text-sm font-bold">{String(timeLeft.days).padStart(2, '0')}</div>
            <span className="text-white">:</span>
            <div className="bg-red-800 rounded px-2 py-1 text-sm font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
            <span className="text-white">:</span>
            <div className="bg-red-800 rounded px-2 py-1 text-sm font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
            <span className="text-white">:</span>
            <div className="bg-red-800 rounded px-2 py-1 text-sm font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
          </div>
        </div>
        <div className="text-sm">{promoData.startDate} - {promoData.endDate}</div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-red-500 px-6 pt-4">
        {['Độc quyền online', 'Màn hình', 'Gaming Gear', 'Phụ kiện'].map((tab, idx) => (
          <button
            key={idx}
            className={`pb-3 px-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
              idx === 0 ? 'border-white' : 'border-transparent hover:border-red-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Products Carousel */}
      <div className="p-6 relative">
        <div className="flex items-center gap-4">
          <Button
            onClick={handlePrev}
            size="icon"
            className="flex-shrink-0 bg-white/20 hover:bg-white/30 text-white rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div className="flex-1 overflow-hidden">
            <div className="grid grid-cols-4 gap-4">
              {promoData.products.map((product, idx) => (
                <div
                  key={product.id}
                  className={`bg-white rounded-lg p-4 transition-opacity ${
                    idx === currentIndex ? 'opacity-100' : 'opacity-50'
                  }`}
                >
                  <div className="bg-gray-200 rounded mb-3 aspect-square overflow-hidden">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-gray-900 text-sm font-medium line-clamp-2 mb-2">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < product.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="text-xs text-gray-500">({product.reviews})</span>
                  </div>
                  <div className="mb-3">
                    <div className="line-through text-gray-500 text-xs">
                      {product.originalPrice.toLocaleString()}đ
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-red-600 font-bold">{product.discountedPrice.toLocaleString()}đ</span>
                      <span className="bg-red-600 text-white text-xs px-1 rounded">-{product.discount}%</span>
                    </div>
                  </div>
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white text-xs py-1">
                    Xem chi tiết
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={handleNext}
            size="icon"
            className="flex-shrink-0 bg-white/20 hover:bg-white/30 text-white rounded-full"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <div className="mt-6 text-center">
          <Button className="bg-white hover:bg-gray-100 text-red-600 font-medium">
            Xem thêm khuyến mãi
          </Button>
        </div>
      </div>
    </section>
  )
}

// --- Component Chính (Trang chi tiết Blog) ---
const BlogDetails = () => {
  return (
    <div className="container mx-auto py-8">
      {/* Nội dung bài viết blog của bạn sẽ nằm ở đây */}
      <div className="prose max-w-none mb-8">
        <h1 className="text-3xl font-bold mb-4">Tiêu đề bài viết Blog</h1>
        <p className="text-gray-600">Nội dung bài viết...</p>
      </div>

      {/* Chèn section khuyến mãi vào đây */}
      <BlogPromoSection />
    </div>
  );
};

// --- Export Default để sửa lỗi ở public-router.jsx ---
export default BlogDetails;