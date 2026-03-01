import React, { use, useEffect } from 'react';

import {
    Cpu,
    Layout,
    Inbox,
    Zap,
    MemoryStick,
    Wind,
    Monitor,
    HardDrive,
    Database,
    CheckCircle2,
    Phone,
    Star,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import banner1 from '../../assets/img_banner_section1.png';
import banner2 from '../../assets/img_banner_section2.png';
import AddToCartButton from '@/components/customer/AddToCartButton';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '@/services/product/product.api';
const categories = [
    { id: 'cpu', name: 'CPU', desc: 'Bộ vi xử lý', icon: <Cpu /> },
    { id: 'vga', name: 'VGA', desc: 'Card đồ họa', icon: <Monitor /> },
    { id: 'mainboard', name: 'Mainboard', desc: 'Bo mạch chủ', icon: <Layout /> },
    { id: 'ram', name: 'RAM', desc: 'Bộ nhớ trong', icon: <MemoryStick /> },
    { id: 'ssd', name: 'Ổ cứng SSD', desc: 'Tốc độ cao', icon: <Zap /> },
    { id: 'hdd', name: 'Ổ cứng HDD', desc: 'Lưu trữ lớn', icon: <Database /> },
    { id: 'psu', name: 'Nguồn', desc: 'Công suất thực', icon: <Inbox /> },
    { id: 'cooling', name: 'Tản nhiệt', desc: 'Làm mát tối ưu', icon: <Wind /> },
    { id: 'case', name: 'Case', desc: 'Vỏ máy tính', icon: <Layout className="rotate-90" /> },
];
const benefits = [
    'Tư vấn cấu hình phù hợp ngân sách',
    'Lắp ráp chuyên nghiệp, test kỹ càng',
    'Bảo hành linh kiện từ 12-36 tháng',
];

const homePage = () => {
    const data_ui = JSON.parse(localStorage.getItem('data_ui')) || {};
    const [dataNewProducts, setDataNewProducts] = React.useState([]);
    const [dataHotProducts, setDataHotProducts] = React.useState([]);
    const navigate = useNavigate();
    useEffect(() => {
        // Fetch new products
        const fetchNewProducts = async () => {
            try {
                const response = await getProducts({ sort: 'newest', limit: 5 });
                setDataNewProducts(response.data || []);
            } catch (error) {
                console.error('Error fetching new products:', error);
            }
        };
        const fetchHotProducts = async () => {
            try {
                const response = await getProducts({ sort: 'rating', limit: 5 });
                setDataHotProducts(response.data || []);
            } catch (error) {
                console.error('Error fetching hot products:', error);
            }
        };
        fetchHotProducts();
        fetchNewProducts();
    }, []);
    const handleCategoryClick = (categorySlug) => {
        navigate(`/product?category=${categorySlug}`);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
            {/* --- BANNER SECTION 1 --- */}
            <section className="relative bg-[#EEF2FF] rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row items-center p-4 md:p-8 mb-8">
                <div className="z-10 flex-1 space-y-6">
                    <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                        <span className="animate-pulse">⚡</span> Khuyến mãi đặc biệt
                    </div>
                    <h1 className="text-2xl md:text-4xl font-inter font-bold text-slate-900 leading-tight">
                        Build PC Chuyên Nghiệp <br /> Theo Yêu Cầu
                    </h1>
                    <p className="text-slate-500 text-lg">Linh kiện chính hãng, tư vấn miễn phí, bảo hành tận tâm</p>
                    <div className="flex gap-4">
                        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 rounded-xl">
                            🛠 Build PC Ngay
                        </Button>
                        <Button size="lg" variant="outline" className="px-8 rounded-xl">
                            Xem Sản Phẩm
                        </Button>
                    </div>
                </div>

                {/* PC Image Container */}
                <div className="relative flex-1 flex justify-end mt-8 md:mt-0">
                    <img src={banner1} alt="Gaming PC" className="w-full max-w-md object-contain " />
                </div>
            </section>

            {/* --- USER STATUS BAR --- */}
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-12 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 ">
                        <AvatarImage src={data_ui?.avatar} />
                        <AvatarFallback>{data_ui?.userName?.charAt(0) || 'A'}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-bold text-slate-900">Xin chào, {data_ui?.userName || 'User'}!</h3>
                        <p className="text-sm text-slate-500">
                            Chào mừng bạn quay trở lại. Khám phá những sản phẩm mới nhất dành cho bạn.
                        </p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="bg-blue-50 px-6 py-2 rounded-xl text-center">
                        <p className="text-[10px] uppercase text-slate-400 font-bold">Điểm tích lũy</p>
                        <p className="text-blue-600 font-bold text-xl">2,450</p>
                    </div>
                    <div className="bg-orange-50 px-6 py-2 rounded-xl text-center border border-orange-100">
                        <p className="text-[10px] uppercase text-slate-400 font-bold">Voucher</p>
                        <p className="text-orange-600 font-bold text-xl">5</p>
                    </div>
                </div>
            </div>

            {/* --- CATEGORIES SECTION --- */}
            <section>
                <h2 className="text-2xl font-bold mb-6 text-slate-800">Danh Mục Sản Phẩm</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {categories.map((cat, index) => (
                        <Card
                            key={index}
                            className="hover:shadow-md transition-shadow cursor-pointer border-none bg-white py-6"
                            onClick={() => handleCategoryClick(cat.id)}
                        >
                            <CardContent className="flex flex-col items-center justify-center p-0 space-y-3">
                                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">{cat.icon}</div>
                                <div className="text-center">
                                    <p className="font-bold text-slate-800">{cat.title}</p>
                                    <p className="text-[11px] text-slate-400">{cat.desc}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* --- NEW PRODUCTS SECTION --- */}
            <section className="mb-12 space-y-5">
                <div className="mt-16 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-800">Sản Phẩm Mới</h2>
                    <Button variant="link" className="text-blue-600 font-semibold">
                        Xem tất cả →
                    </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {dataNewProducts.map((product, index) => (
                        <ProductCard key={index} {...product} />
                    ))}
                </div>
            </section>
            {/* --- BANNER SECTION 2 --- */}
            <section className="relative bg-[#0066FF] rounded-3xl overflow-hidden shadow-lg my-12">
                <div className="flex flex-col md:flex-row items-center min-h-115">
                    {/* Nội dung bên trái */}
                    <div className="flex-1 p-8 md:p-16 text-white z-10">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                            <span className="text-lg">🎁</span> Ưu đãi đặc biệt
                        </div>

                        <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
                            Dịch Vụ Build PC Chuyên Nghiệp
                        </h2>

                        <p className="text-blue-100 text-lg mb-8 font-medium">
                            Tư vấn miễn phí - Lắp ráp tận tâm - Bảo hành chu đáo
                        </p>

                        <ul className="space-y-4 mb-10">
                            {benefits.map((benefit, index) => (
                                <li key={index} className="flex items-center gap-3">
                                    <CheckCircle2 className="w-6 h-6 text-white fill-blue-500/30" />
                                    <span className="text-blue-50 font-medium">{benefit}</span>
                                </li>
                            ))}
                        </ul>

                        <Button
                            size="lg"
                            className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-8 py-6 rounded-xl shadow-xl transition-all hover:scale-105 active:scale-95"
                        >
                            <Phone className="w-5 h-5 mr-2 fill-blue-600" />
                            Liên Hệ Ngay
                        </Button>
                    </div>

                    {/* Hình ảnh bên phải */}
                    <div className="flex-1 relative h-full w-full min-h-75 md:min-h-115">
                        <img
                            src={banner2}
                            alt="PC Technician"
                            className="absolute bottom-0 right-5 h-full w-full object-contain object-bottom-right select-none"
                        />
                    </div>
                </div>
            </section>
            {/* --- HOT PRODUCTS SECTION --- */}
            <section className="mb-12 space-y-5">
                <div className="mt-16 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-800">Sản Phẩm Có Lượt Đánh Giá Tốt</h2>
                    <Button variant="link" className="text-blue-600 font-semibold">
                        Xem tất cả →
                    </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {dataHotProducts.map((product, index) => (
                        <ProductCard key={index} {...product} />
                    ))}
                </div>
            </section>
        </div>
    );
};
function ProductCard({ _id, name, price, averageRating, reviewCount, images }) {
    const navigate = useNavigate();
    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

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
                <AddToCartButton productId={_id} name={name} price={price} image={images?.[0]?.url || images} />
            </div>
        </div>
    );
}

export default homePage;
