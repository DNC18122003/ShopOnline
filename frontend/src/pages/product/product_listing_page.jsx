'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ShoppingCart, Star } from 'lucide-react';

function ProductCard({
  name,
  brand,
  price,
  originalPrice,
  rating,
  reviews,
  image,
  badge,
}) {
  // Hàm format tiền VND
  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative bg-gradient-to-br from-muted to-muted/50 h-48 overflow-hidden group">
        <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <div className="text-5xl mb-2">🖥️</div>
            <p className="text-sm">{brand}</p>
          </div>
        </div>
        {badge && (
          <div className="absolute top-3 right-3 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded">
            {badge}
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs font-semibold text-primary uppercase mb-1">{brand}</p>
        <h3 className="text-sm font-semibold text-foreground mb-3 line-clamp-2">{name}</h3>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.round(rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({reviews})</span>
        </div>

        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-lg font-bold text-primary">{formatVND(price)}</span>
          <span className="text-sm text-muted-foreground line-through">{formatVND(originalPrice)}</span>
        </div>

        <button className="w-full bg-primary hover:bg-accent text-primary-foreground font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition">
          <ShoppingCart className="w-4 h-4" />
          Thêm Vào Giỏ
        </button>
      </div>
    </div>
  );
}

// Dữ liệu mẫu - tạm thời cho giao diện
const mockProducts = [
  {
    name: 'NVIDIA GeForce RTX 4090',
    brand: 'Card Đồ Họa RTX',
    price: 38900000,
    originalPrice: 48900000,
    rating: 5,
    reviews: 234,
    badge: 'Card Đồ Họa',
    image: '',
  },
  {
    name: 'NVIDIA GeForce RTX 4080',
    brand: 'Card Đồ Họa RTX',
    price: 29200000,
    originalPrice: 38900000,
    rating: 5,
    reviews: 189,
    badge: 'Card Đồ Họa',
    image: '',
  },
  {
    name: 'ASUS ROG Strix G15',
    brand: 'Laptop Gaming',
    price: 46300000,
    originalPrice: 60900000,
    rating: 5,
    reviews: 156,
    badge: 'Laptop Gaming',
    image: '',
  },
  {
    name: 'ASUS ROG Strix Z690-E',
    brand: 'Bo Mạch Chủ',
    price: 14600000,
    originalPrice: 19500000,
    rating: 5,
    reviews: 78,
    badge: 'Bo Mạch Chủ',
    image: '',
  },
  {
    name: 'NVIDIA GeForce RTX 4070',
    brand: 'Card Đồ Họa RTX',
    price: 19500000,
    originalPrice: 24400000,
    rating: 4,
    reviews: 302,
    badge: 'Card Đồ Họa',
    image: '',
  },
  {
    name: 'MSI Katana 15',
    brand: 'Laptop Gaming',
    price: 34100000,
    originalPrice: 43900000,
    rating: 5,
    reviews: 142,
    badge: 'Laptop Gaming',
    image: '',
  },
  {
    name: 'NVIDIA GeForce RTX 4060',
    brand: 'Card Đồ Họa RTX',
    price: 7300000,
    originalPrice: 9700000,
    rating: 4,
    reviews: 456,
    badge: 'Card Đồ Họa',
    image: '',
  },
  {
    name: 'ASUS TUF Gaming A16',
    brand: 'Laptop Gaming',
    price: 38900000,
    originalPrice: 48900000,
    rating: 5,
    reviews: 267,
    badge: 'Laptop Gaming',
    image: '',
  },
];

export default function ProductListingPage({ products = mockProducts }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('best-match');
  const [expandedSection, setExpandedSection] = useState('category');

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const itemsPerPage = 6;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedProducts = products.slice(startIndex, startIndex + itemsPerPage);

  return (
    <main className="flex-1 flex max-w-7xl mx-auto w-full">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-sidebar p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-sidebar-foreground">Bộ Lọc</h2>
          <a href="#" className="text-primary text-sm font-medium hover:underline">
            Xóa Tất Cả
          </a>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <button
            onClick={() => toggleSection('category')}
            className="w-full flex items-center justify-between py-2 hover:bg-sidebar-accent/30 rounded-lg px-2 transition"
          >
            <h3 className="font-semibold text-sidebar-foreground">Danh Mục</h3>
            <ChevronDown
              className={`w-5 h-5 text-sidebar-foreground transition-transform ${
                expandedSection === 'category' ? 'rotate-180' : ''
              }`}
            />
          </button>

          {expandedSection === 'category' && (
            <div className="space-y-3 mt-3 ml-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded accent-primary"
                />
                <span className="text-sidebar-foreground text-sm">Card Đồ Họa</span>
                <span className="text-sidebar-accent-foreground text-xs ml-auto">(247)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-primary" />
                <span className="text-sidebar-foreground text-sm">Laptop</span>
                <span className="text-sidebar-accent-foreground text-xs ml-auto">(180)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-primary" />
                <span className="text-sidebar-foreground text-sm">Bo Mạch Chủ</span>
                <span className="text-sidebar-accent-foreground text-xs ml-auto">(156)</span>
              </label>
            </div>
          )}
        </div>

        {/* Price Range Filter */}
        <div className="mb-8">
          <button
            onClick={() => toggleSection('price')}
            className="w-full flex items-center justify-between py-2 hover:bg-sidebar-accent/30 rounded-lg px-2 transition"
          >
            <h3 className="font-semibold text-sidebar-foreground">Khoảng Giá</h3>
            <ChevronDown
              className={`w-5 h-5 text-sidebar-foreground transition-transform ${
                expandedSection === 'price' ? 'rotate-180' : ''
              }`}
            />
          </button>

          {expandedSection === 'price' && (
            <div className="space-y-3 mt-3 ml-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-primary" />
                <span className="text-sidebar-foreground text-sm">Dưới 10 triệu</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-primary" />
                <span className="text-sidebar-foreground text-sm">10 - 20 triệu</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-primary" />
                <span className="text-sidebar-foreground text-sm">20 - 40 triệu</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-primary" />
                <span className="text-sidebar-foreground text-sm">Trên 40 triệu</span>
              </label>
              <div className="flex gap-2 mt-4">
                <input
                  type="number"
                  placeholder="Tối thiểu"
                  className="w-20 px-2 py-1 border border-input rounded text-sidebar-foreground bg-background text-sm"
                />
                <input
                  type="number"
                  placeholder="Tối đa"
                  className="w-20 px-2 py-1 border border-input rounded text-sidebar-foreground bg-background text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Brand Filter */}
        <div className="mb-8">
          <button
            onClick={() => toggleSection('brand')}
            className="w-full flex items-center justify-between py-2 hover:bg-sidebar-accent/30 rounded-lg px-2 transition"
          >
            <h3 className="font-semibold text-sidebar-foreground">Thương Hiệu</h3>
            <ChevronDown
              className={`w-5 h-5 text-sidebar-foreground transition-transform ${
                expandedSection === 'brand' ? 'rotate-180' : ''
              }`}
            />
          </button>

          {expandedSection === 'brand' && (
            <div className="space-y-3 mt-3 ml-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-primary" />
                <span className="text-sidebar-foreground text-sm">NVIDIA</span>
                <span className="text-sidebar-accent-foreground text-xs ml-auto">(89)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-primary" />
                <span className="text-sidebar-foreground text-sm">AMD</span>
                <span className="text-sidebar-accent-foreground text-xs ml-auto">(67)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-primary" />
                <span className="text-sidebar-foreground text-sm">ASUS</span>
                <span className="text-sidebar-accent-foreground text-xs ml-auto">(45)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-primary" />
                <span className="text-sidebar-foreground text-sm">MSI</span>
                <span className="text-sidebar-accent-foreground text-xs ml-auto">(34)</span>
              </label>
            </div>
          )}
        </div>

        {/* Memory Filter */}
        <div>
          <button
            onClick={() => toggleSection('memory')}
            className="w-full flex items-center justify-between py-2 hover:bg-sidebar-accent/30 rounded-lg px-2 transition"
          >
            <h3 className="font-semibold text-sidebar-foreground">Bộ Nhớ</h3>
            <ChevronDown
              className={`w-5 h-5 text-sidebar-foreground transition-transform ${
                expandedSection === 'memory' ? 'rotate-180' : ''
              }`}
            />
          </button>

          {expandedSection === 'memory' && (
            <div className="space-y-3 mt-3 ml-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-primary" />
                <span className="text-sidebar-foreground text-sm">8GB</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-primary" />
                <span className="text-sidebar-foreground text-sm">16GB</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-primary" />
                <span className="text-sidebar-foreground text-sm">24GB</span>
              </label>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 px-8 py-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Card Đồ Họa</h1>
            <p className="text-muted-foreground">Tìm thấy {products.length} sản phẩm</p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-foreground">Sắp xếp:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="best-match">Phù Hợp Nhất</option>
              <option value="price-low">Giá: Thấp đến Cao</option>
              <option value="price-high">Giá: Cao đến Thấp</option>
              <option value="newest">Mới Nhất</option>
              <option value="rating">Đánh Giá Cao Nhất</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {displayedProducts.map((product, index) => (
            <ProductCard
              key={index}
              name={product.name}
              brand={product.brand}
              price={product.price}
              originalPrice={product.originalPrice}
              rating={product.rating}
              reviews={product.reviews}
              image={product.badge}
              badge={product.badge}
            />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 mt-12">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1;
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
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
                  <span key={`dots-${page}`} className="px-2 py-1 text-foreground">
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>
    </main>
  );
}