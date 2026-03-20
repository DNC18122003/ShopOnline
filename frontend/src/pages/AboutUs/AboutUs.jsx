import React from 'react';
import { ShieldCheck, Truck, HeartHandshake, Users, Zap, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const values = [
    {
        title: 'Chất lượng hàng đầu',
        description: 'Chúng tôi cam kết mang đến những sản phẩm công nghệ chính hãng, uy tín với chất lượng tốt nhất thị trường.',
        icon: <Award className="w-8 h-8 text-blue-500" />
    },
    {
        title: 'Bảo hành an tâm',
        description: 'Chính sách bảo hành minh bạch, hỗ trợ tận tâm giúp khách hàng luôn yên tâm khi mua sắm.',
        icon: <ShieldCheck className="w-8 h-8 text-blue-500" />
    },
    {
        title: 'Giao hàng siêu tốc',
        description: 'Tối ưu hóa quy trình đóng gói và vận chuyển, đưa sản phẩm đến tay khách hàng trong thời gian ngắn nhất.',
        icon: <Truck className="w-8 h-8 text-blue-500" />
    },
    {
        title: 'Đồng hành cùng bạn',
        description: 'Đội ngũ tư vấn nhiệt tình, có chuyên môn cao luôn sẵn sàng giải đáp mọi thắc mắc của bạn.',
        icon: <HeartHandshake className="w-8 h-8 text-blue-500" />
    },
    {
        title: 'Cộng đồng đam mê',
        description: 'Xây dựng một sân chơi cho những người yêu công nghệ, nơi chia sẻ kiến thức và kinh nghiệm.',
        icon: <Users className="w-8 h-8 text-blue-500" />
    },
    {
        title: 'Tốc độ & Đổi mới',
        description: 'Luôn cập nhật những xu hướng công nghệ mới nhất, mang tới các cấu hình PC mạnh mẽ, hiện đại.',
        icon: <Zap className="w-8 h-8 text-blue-500" />
    }
];

export default function AboutUs() {
    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col pt-16 pb-20">
            {/* Hero Section */}
            <section className="w-full relative py-20 lg:py-32 flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 overflow-hidden text-center text-white">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1593640495253-23196b27a87f?q=80&w=2000&auto=format&fit=crop')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
                <div className="relative z-10 container mx-auto px-4 max-w-4xl">
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 mt-4">
                        Khám Phá <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Công Nghệ</span> Cùng Chúng Tôi
                    </h1>
                    <p className="text-xl md:text-2xl font-light text-blue-100 max-w-2xl mx-auto leading-relaxed">
                        Chúng tôi không chỉ là một cửa hàng thương mại. Chúng tôi là điểm đến của những tâm hồn đam mê công nghệ.
                    </p>
                </div>
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
            </section>

            {/* Our Story Section */}
            <section className="container mx-auto px-4 py-20 lg:py-28 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <div className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-800 tracking-wide uppercase">
                            Câu chuyện của chúng tôi
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                            Khởi nguồn từ đam mê, <br className="hidden md:block"/> kiến tạo tương lai.
                        </h2>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Được sinh ra từ khao khát mang lại những cỗ máy PC mạnh mẽ và hệ sinh thái công nghệ trọn vẹn nhất cho người dùng Việt Nam. Chúng tôi tin rằng, mỗi chiếc máy tính không chỉ là một công cụ hỗ trợ công việc, mà còn là người bạn đồng hành thực thụ của giới game thủ cũng như dân sáng tạo.
                        </p>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Từ một ý tưởng nhỏ bé, bằng nỗ lực không ngừng nghỉ, đội ngũ đã hoàn thành chặng đường xây dựng và vươn xa để trở thành biểu tượng mua sắm công nghệ uy tín, mang lại trải nghiệm tối ưu nhất.
                        </p>
                    </div>
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative bg-white rounded-3xl p-2 h-full w-full overflow-hidden shadow-2xl">
                            <img 
                                src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1470&auto=format&fit=crop" 
                                alt="Shop space" 
                                className="object-cover rounded-2xl w-full h-[400px] lg:h-[500px] group-hover:scale-105 transition-transform duration-700 ease-in-out"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="bg-white py-20 lg:py-28">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="text-center mb-16 max-w-2xl mx-auto space-y-4">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Giá Trị Cốt Lõi</h2>
                        <p className="text-lg text-gray-500">
                            Những nguyên tắc thiết yếu định hình phong cách phục vụ và cách chúng tôi xây dựng nền tảng công nghệ mỗi ngày.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {values.map((val, idx) => (
                            <div 
                                key={idx} 
                                className="group relative p-8 bg-zinc-50 rounded-3xl hover:bg-white border border-transparent hover:border-zinc-200 hover:shadow-xl transition-all duration-300"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    {val.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{val.title}</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {val.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to action */}
            <section className="container mx-auto px-4 py-20">
                <div className="bg-gradient-to-br from-blue-700 to-indigo-800 rounded-3xl overflow-hidden shadow-2xl relative">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1627398225058-eb56a8eb390e?q=80&w=2070&auto=format&fit=crop')] opacity-20 bg-cover bg-center mix-blend-overlay"></div>
                    <div className="relative z-10 px-6 py-16 md:py-24 text-center text-white">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Trải nghiệm sức mạnh, nâng tầm đẳng cấp</h2>
                        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto font-light">
                            Đã đến lúc nâng cấp không gian làm việc và khu vực giải trí của bạn với những lựa chọn cấu hình PC tối ưu nhất.
                        </p>
                        <Link 
                            to="/product" 
                            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold bg-white text-blue-600 hover:bg-blue-50 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            Mua sắm ngay
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};


