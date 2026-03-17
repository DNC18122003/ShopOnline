import React, { useEffect, useState } from 'react';
import { getDashBoard } from '../../services/admin/admin.api';
import { DollarSign, ShoppingCart, Package, Layers, Tag, Percent, AlertTriangle } from 'lucide-react';
import PaymentChart from './PaymentChart';
import OrderChart from './OrderChart';
import RevenueChart from './RevenueChart';

const AdminDashBoard = () => {
    const [dashboard, setDashboard] = useState(null);

    const fetchDashboard = async () => {
        try {
            const data = await getDashBoard();

            console.log('dashboard:', data);

            setDashboard(data); 
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    if (!dashboard) return <div>Loading...</div>;

    return (
        <div className="p-6 space-y-8">
            {/* ===== STATISTICS ===== */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    {
                        title: 'Tổng doanh thu',
                        value: dashboard.totalRevenue.toLocaleString() + '₫',
                        icon: <DollarSign />,
                    },
                    {
                        title: 'Tổng đơn hàng',
                        value: dashboard.totalOrders,
                        icon: <ShoppingCart />,
                    },
                    {
                        title: 'Tổng sản phẩm',
                        value: dashboard.totalProducts,
                        icon: <Package />,
                    },
                    {
                        title: 'Danh mục',
                        value: dashboard.totalCategories,
                        icon: <Layers />,
                    },
                    {
                        title: 'Thương hiệu',
                        value: dashboard.totalBrands,
                        icon: <Tag />,
                    },
                    {
                        title: 'Mã giảm giá',
                        value: dashboard.totalDiscounts,
                        icon: <Percent />,
                    },
                ].map((item, index) => (
                    <div key={index} className="bg-white rounded-2xl shadow-md border p-6 relative">
                        <div className="absolute top-5 right-5 bg-blue-100 p-2 rounded-full text-blue-600">
                            {item.icon}
                        </div>

                        <p className="text-gray-500 text-sm">{item.title}</p>
                        <p className="text-3xl font-bold text-blue-600 mt-2">{item.value}</p>
                    </div>
                ))}
            </div>

            {/* ===== ROW 1 ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* TOP PRODUCTS */}
                <div className="bg-white p-6 rounded-2xl shadow-md border h-full">
                    <div className="flex items-center gap-2 mb-4">
                        <Package className="text-purple-500" size={20} />
                        <h2 className="font-bold text-lg ">Top Selling Products</h2>
                    </div>

                    {dashboard.topProducts.map((p) => (
                        <div key={p._id} className="flex items-center gap-4 py-3 border-b last:border-none">
                            <img src={p.images[0]} className="w-14 h-14 object-cover rounded-lg" />

                            <div className="flex-1">
                                <p className="font-semibold">{p.name}</p>
                                <p className="text-gray-500 text-sm">{p.price.toLocaleString()}₫</p>
                            </div>

                            <p className="font-bold text-blue-600">Sold: {p.sold}</p>
                        </div>
                    ))}
                </div>
                <div className="h-full">
                    <RevenueChart data={dashboard.revenueChart} />
                </div>
            </div>

            {/* ===== ROW 2 ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-full">
                    <PaymentChart data={dashboard.paymentChart} />
                </div>

                {/* LOW STOCK */}
                <div className="bg-white p-6 rounded-2xl shadow-md border h-full">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="text-red-500" size={20} />
                        <h2 className="font-bold text-lg leading-none">Low Stock Warning</h2>
                    </div>
                    {dashboard.lowStockProducts.map((p) => (
                        <div key={p._id} className="flex justify-between items-center py-3 border-b last:border-none">
                            <span className="font-medium">{p.name}</span>

                            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                                Stock: {p.stock}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ===== ROW 3 ===== */}
            <div className="bg-white rounded-2xl shadow-md border p-6">
                <OrderChart data={dashboard.orderChart} />
            </div>

            {/* ===== ROW 4 ===== */}
            <div className="bg-white p-6 rounded-2xl shadow-md border">
                <h2 className="font-bold text-lg mb-4">Recent Orders</h2>

                <table className="w-full">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr className="text-blue-500">
                            <th className="p-3 text-left">Customer</th>
                            <th className="p-3">Total</th>
                            <th className="p-3">Payment</th>
                            <th className="p-3">Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {dashboard.recentOrders.map((order) => {
                            const paymentColor =
                                order.paymentMethod === 'MOMOPAY'
                                    ? 'bg-pink-100 text-pink-600'
                                    : 'bg-blue-100 text-blue-600';

                            const statusColor =
                                {
                                    pending: 'bg-yellow-100 text-yellow-700',
                                    confirmed: 'bg-blue-100 text-blue-700',
                                    shipping: 'bg-purple-100 text-purple-700',
                                    delivered: 'bg-green-100 text-green-700',
                                    completed: 'bg-green-100 text-green-700',
                                    cancelled: 'bg-red-100 text-red-700',
                                }[order.orderStatus] || 'bg-gray-100 text-gray-700';

                            return (
                                <tr key={order._id} className="border-t hover:bg-gray-50">
                                    <td className="p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                                                {order.customerId?.userName?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>

                                            <span>{order.customerId?.userName || 'User'}</span>
                                        </div>
                                    </td>

                                    <td className="p-3 text-center font-semibold">
                                        {order.finalAmount.toLocaleString()}₫
                                    </td>

                                    <td className="p-3 text-center">
                                        <span className={`px-3 py-1 rounded-full text-sm ${paymentColor}`}>
                                            {order.paymentMethod}
                                        </span>
                                    </td>

                                    <td className="p-3 text-center">
                                        <span className={`px-3 py-1 rounded-full text-sm ${statusColor}`}>
                                            {order.orderStatus}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashBoard;
