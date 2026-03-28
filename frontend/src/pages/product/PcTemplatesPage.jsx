import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPublicBuildPcTemplates, getPublicBuildPcTemplateById } from '@/services/buildPcTemplate.api';
import { Cpu, Monitor, HardDrive, Box, Search, ChevronLeft, ChevronRight, ShoppingCart, Package, X } from 'lucide-react';
import { toast } from 'react-toastify';

const formatVND = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const getPaginationItems = (currentPage, totalPages) => {
    const delta = 1; // Number of pages to show around the current page
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
            range.push(i);
        }
    }

    for (const i of range) {
        if (l) {
            if (i - l === 2) {
                rangeWithDots.push(l + 1);
            } else if (i - l !== 1) {
                rangeWithDots.push('...');
            }
        }
        rangeWithDots.push(i);
        l = i;
    }
    return rangeWithDots;
};

function TemplateCard({ template, onBuyNow, onViewDetails }) {
    const { name, usageType, totalPrice, componentDetails } = template;

    const pickDisplayComponent = (value) => Array.isArray(value) ? value[0] : value;

    const mainComponents = {
        cpu: pickDisplayComponent(componentDetails?.cpu),
        gpu: pickDisplayComponent(componentDetails?.gpu),
        ram: pickDisplayComponent(componentDetails?.ram),
        ssd: pickDisplayComponent(componentDetails?.ssd || componentDetails?.storage),
    };

    const componentIcons = {
        cpu: <Cpu size={16} className="text-gray-500" />,
        gpu: <Monitor size={16} className="text-gray-500" />,
        ram: <Box size={16} className="text-gray-500" />,
        ssd: <HardDrive size={16} className="text-gray-500" />,
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
            <div className="p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 h-14">{name}</h3>
                {usageType && (
                    <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full mb-4">
                        {usageType}
                    </span>
                )}
                
                <div className="space-y-2 mb-4 border-t border-gray-100 pt-4">
                    {Object.entries(mainComponents).map(([key, comp]) => (
                        comp && (
                            <div key={key} className="flex items-center gap-3 text-sm">
                                <div className="w-6">{componentIcons[key]}</div>
                                <span className="font-medium text-gray-600 w-10">{key.toUpperCase()}:</span>
                                <span className="text-gray-800 truncate flex-1">{comp.name}</span>
                            </div>
                        )
                    ))}
                </div>
            </div>

            <div className="mt-auto bg-gray-50 p-4 border-t border-gray-200">
                <div className="flex items-end justify-between mb-4">
                    <span className="text-sm text-gray-500">Tổng giá dự kiến</span>
                    <span className="text-2xl font-bold text-red-600">{formatVND(totalPrice)}</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => onViewDetails(template._id)} className="flex-1 text-center py-2.5 px-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm">
                        Xem chi tiết
                    </button>
                    <button onClick={() => onBuyNow(template)} className="flex-1 flex items-center justify-center gap-2 text-center py-2.5 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        <ShoppingCart size={16} />
                        Mua ngay
                    </button>
                </div>
            </div>
        </div>
    );
}

function TemplateDetailModal({ templateId, onClose, onBuyNow }) {
    const [template, setTemplate] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTemplate = async () => {
            if (!templateId) return;
            setLoading(true);
            try {
                const res = await getPublicBuildPcTemplateById(templateId);
                if (res.success) {
                    setTemplate(res.data);
                } else {
                    toast.error(res.message || 'Không tìm thấy cấu hình.');
                    onClose();
                }
            } catch (error) {
                toast.error('Lỗi khi tải chi tiết cấu hình.');
                onClose();
            } finally {
                setLoading(false);
            }
        };
        fetchTemplate();
    }, [templateId, onClose]);

    if (!template && !loading) return null;

    const COMPONENT_ORDER = ['cpu', 'main', 'ram', 'gpu', 'ssd', 'hdd', 'psu', 'case', 'cooling'];
    const sortedComponents = template
        ? COMPONENT_ORDER.flatMap((key) => {
            const value = template.components?.[key];
            if (!value) return [];
            if (Array.isArray(value)) {
                return value.filter(Boolean).map((item, idx) => ({ key, ...item, __rowKey: `${key}-${item?._id || idx}` }));
            }
            return [{ key, ...value, __rowKey: `${key}-${value?._id || 'single'}` }];
        }).filter(c => c._id)
        : [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10"
                >
                    <X size={20} />
                </button>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center min-h-[400px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                    </div>
                ) : (
                    <>
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 pr-8">{template.name}</h2>
                            {template.usageType && (
                                <span className="mt-2 inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                                    {template.usageType}
                                </span>
                            )}
                            <p className="mt-3 text-gray-600 text-sm">{template.description}</p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 custom-scrollbar">
                            <h3 className="font-semibold text-gray-800 mb-4">Danh sách linh kiện</h3>
                            <div className="space-y-3">
                                {sortedComponents.map(comp => (
                                    <div key={comp.__rowKey} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                                        <div className="w-12 h-12 bg-gray-50 rounded-md flex items-center justify-center p-1 flex-shrink-0">
                                            <img src={comp.images?.[0] || 'https://via.placeholder.com/100'} alt={comp.name} className="max-w-full max-h-full object-contain" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-bold uppercase text-blue-600">{comp.key}</p>
                                            <p className="text-sm font-medium text-gray-900 truncate">{comp.name}</p>
                                            <p className={`text-xs ${comp.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                {comp.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
                                            </p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="font-bold text-gray-900 text-sm">{formatVND(comp.price)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Tổng thành tiền</p>
                                <p className="text-2xl font-bold text-red-600">{formatVND(template.totalPrice)}</p>
                            </div>
                            <button 
                                onClick={() => onBuyNow(template)}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                            >
                                <ShoppingCart size={18} />
                                Mua ngay
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function PcTemplatesPage() {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ totalPages: 1, page: 1 });
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [selectedTemplateId, setSelectedTemplateId] = useState(null);

    const paginationItems = getPaginationItems(currentPage, pagination.totalPages);

    useEffect(() => {
        const fetchTemplates = async () => {
            setLoading(true);
            try {
                const params = {
                    page: currentPage,
                    limit: 9,
                    keyword: searchTerm || undefined,
                    minPrice: minPrice || undefined,
                    maxPrice: maxPrice || undefined,
                };
                const res = await getPublicBuildPcTemplates(params);
                if (res.success) {
                    setTemplates(res.data || []);
                    setPagination(res.pagination || { totalPages: 1, page: 1 });
                }
            } catch (error) {
                console.error("Failed to fetch PC templates:", error);
                toast.error("Không thể tải danh sách cấu hình.");
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchTemplates, 300);
        return () => clearTimeout(timer);
    }, [currentPage, searchTerm, minPrice, maxPrice]);

    const handleBuyNow = (template) => {
        const components = template.componentDetails || template.components || {};
        const items = Object.entries(components).flatMap(([key, value]) => {
            if (!value) return [];
            if (Array.isArray(value)) {
                return value
                    .filter((product) => product && product._id)
                    .map((product) => ({
                productId: product._id,
                nameSnapshot: product.name,
                priceSnapshot: product.price,
                imageSnapshot: product.images?.[0] || '',
                quantity: 1,
                        category: key,
            }));
            }

            const product = value;
            if (!product?._id) return [];
            return [{
                productId: product._id,
                nameSnapshot: product.name,
                priceSnapshot: product.price,
                imageSnapshot: product.images?.[0] || '',
                quantity: 1,
                category: key,
            }];
        });

        if (items.length === 0) {
            toast.warn("Cấu hình này hiện chưa có linh kiện, không thể mua ngay.");
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
        toast.success(`Đang chuyển đến trang thanh toán cho cấu hình "${template.name}".`);
    };

    const handleViewDetails = (templateId) => {
        setSelectedTemplateId(templateId);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <header className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-gray-900">Cấu Hình PC Mẫu</h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Khám phá các bộ máy được xây dựng sẵn bởi chuyên gia, tối ưu cho mọi nhu cầu.
                    </p>
                </header>

                {/* Filters */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
                    <div className="relative w-full md:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input type="text" placeholder="Tìm theo tên, mục đích (vd: gaming)..." value={searchTerm} onChange={(e) => { setCurrentPage(1); setSearchTerm(e.target.value); }} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <input type="number" placeholder="Giá từ" value={minPrice} onChange={(e) => { setCurrentPage(1); setMinPrice(e.target.value); }} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                        <span className="text-gray-500">-</span>
                        <input type="number" placeholder="Giá đến" value={maxPrice} onChange={(e) => { setCurrentPage(1); setMaxPrice(e.target.value); }} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {[...Array(6)].map((_, i) => <div key={i} className="h-96 bg-gray-200 rounded-xl" />)}
                    </div>
                ) : templates.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed">
                        <Package size={48} className="mx-auto text-gray-300" />
                        <h3 className="mt-4 text-lg font-semibold text-gray-800">Không tìm thấy cấu hình phù hợp</h3>
                        <p className="mt-1 text-gray-500">Vui lòng thử lại với bộ lọc khác.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map(template => (
                            <TemplateCard key={template._id} template={template} onBuyNow={handleBuyNow} onViewDetails={handleViewDetails} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center">
                        <div className="flex items-center space-x-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            {paginationItems.map((page, index) =>
                                page === '...' ? (
                                    <span key={`dots-${index}`} className="px-4 py-2 text-gray-500">...</span>
                                ) : (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        {page}
                                    </button>
                                )
                            )}
                            <button onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))} disabled={currentPage === pagination.totalPages} className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {selectedTemplateId && (
                <TemplateDetailModal 
                    templateId={selectedTemplateId} 
                    onClose={() => setSelectedTemplateId(null)} 
                    onBuyNow={(tpl) => { handleBuyNow(tpl); setSelectedTemplateId(null); }} 
                />
            )}
        </div>
    );
}