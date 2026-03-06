import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPublicBuildPcTemplateById } from '@/services/buildPcTemplate.api';
import { ShoppingCart, ArrowLeft, Package, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const formatVND = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const COMPONENT_ORDER = ['cpu', 'main', 'ram', 'gpu', 'ssd', 'hdd', 'psu', 'case', 'cooling'];

export default function PcTemplateDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [template, setTemplate] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTemplate = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const res = await getPublicBuildPcTemplateById(id);
                if (res.success) {
                    setTemplate(res.data);
                } else {
                    toast.error(res.message || 'Không tìm thấy cấu hình.');
                    navigate('/pc-templates');
                }
            } catch (error) {
                toast.error('Lỗi khi tải chi tiết cấu hình.');
                navigate('/pc-templates');
            } finally {
                setLoading(false);
            }
        };
        fetchTemplate();
    }, [id, navigate]);

    const handleAddToCart = () => {
        if (!template) return;

        const items = Object.entries(template.components)
            .filter(([, product]) => product && product._id)
            .map(([key, product]) => ({
                productId: product._id,
                nameSnapshot: product.name,
                priceSnapshot: product.price,
                imageSnapshot: product.images?.[0] || '',
                quantity: 1,
                category: key
            }));

        if (items.length === 0) {
            toast.warn("Cấu hình này hiện chưa có linh kiện, không thể thêm vào giỏ hàng.");
            return;
        }

        const buildPcData = {
            items,
            totalPrice: template.totalPrice,
            isBuildPc: true,
            templateName: template.name,
        };

        localStorage.setItem('buildpc_checkout', JSON.stringify(buildPcData));
        navigate('/checkout');
        toast.success(`Đã thêm cấu hình "${template.name}" vào giỏ hàng.`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    if (!template) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center text-center">
                <div>
                    <h2 className="text-2xl font-bold">Không tìm thấy cấu hình</h2>
                    <button onClick={() => navigate('/pc-templates')} className="mt-4 text-blue-600 font-semibold">
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    const sortedComponents = COMPONENT_ORDER.map(key => ({ key, ...template.components[key] })).filter(c => c._id);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold mb-4">
                    <ArrowLeft size={18} />
                    Quay lại
                </button>

                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="p-8">
                        <h1 className="text-3xl font-bold text-gray-900">{template.name}</h1>
                        {template.usageType && (
                            <span className="mt-2 inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">
                                {template.usageType}
                            </span>
                        )}
                        <p className="mt-3 text-gray-600">{template.description}</p>
                    </div>

                    <div className="px-8 pb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Danh sách linh kiện</h2>
                        <div className="space-y-4">
                            {sortedComponents.map(comp => (
                                <div key={comp._id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center p-1 flex-shrink-0">
                                        <img src={comp.images?.[0] || 'https://via.placeholder.com/100'} alt={comp.name} className="max-w-full max-h-full object-contain" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold uppercase text-blue-600">{comp.key}</p>
                                        <Link to={`/product/${comp._id}`} className="font-semibold text-gray-800 hover:underline">{comp.name}</Link>
                                        <p className={`text-sm font-medium ${comp.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {comp.stock > 0 ? `Còn hàng (${comp.stock})` : 'Hết hàng'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">{formatVND(comp.price)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-center sm:text-left">
                            <span className="text-gray-600">Tổng cộng</span>
                            <p className="text-3xl font-extrabold text-red-600">{formatVND(template.totalPrice)}</p>
                        </div>
                        <button onClick={handleAddToCart} className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 text-lg">
                            <ShoppingCart />
                            Thêm vào giỏ hàng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}