import React from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
const footer = () => {
    return (
        <footer className="bg-gray-700 text-primary-foreground py-5 px-2 sm:px-4 lg:px-6">
            <div className="max-w-7xl mx-auto">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* About Section */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-lg font-semibold">Về Chúng Tôi</h3>
                        <p className="text-sm opacity-90 leading-relaxed">
                            Shop cung cấp các linh kiện PC chất lượng cao với dịch vụ tuyệt vời và hỗ trợ tận tâm.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-lg font-semibold">Liên Kết</h3>
                        <ul className="text-sm space-y-2">
                            <li>
                                <a href="#" className="hover:underline opacity-90 hover:opacity-100 transition">
                                    Sản Phẩm
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:underline opacity-90 hover:opacity-100 transition">
                                    Về Chúng Tôi
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:underline opacity-90 hover:opacity-100 transition">
                                    Chính Sách
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:underline opacity-90 hover:opacity-100 transition">
                                    Liên Hệ
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-lg font-semibold">Liên Hệ</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-3">
                                <Phone size={18} className="flex-shrink-0" />
                                <a
                                    href="tel:0338081728"
                                    className="hover:underline opacity-90 hover:opacity-100 transition"
                                >
                                    0338081728
                                </a>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail size={18} className="flex-shrink-0" />
                                <a
                                    href="mailto:dannhhe173549@fpt.edu.vn"
                                    className="hover:underline opacity-90 hover:opacity-100 transition break-all"
                                >
                                    dannhhe173549@fpt.edu.vn
                                </a>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin size={18} className="flex-shrink-0 mt-0.5" />
                                <span className="opacity-90">72 Yên Lãng, FPT, Hà Nội</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-primary-foreground/20 my-8"></div>

                {/* Bottom Footer */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
                    <p className="opacity-90">© 2024 Shop. Tất cả quyền được bảo lưu.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:underline opacity-90 hover:opacity-100 transition">
                            Chính Sách Bảo Mật
                        </a>
                        <a href="#" className="hover:underline opacity-90 hover:opacity-100 transition">
                            Điều Khoản Sử Dụng
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default footer;
