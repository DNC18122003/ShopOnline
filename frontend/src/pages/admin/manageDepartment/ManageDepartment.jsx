import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const mockDepartments = [
    {
        _id: '1',
        name: 'admin',
        description: 'Quản lý hệ thống',
        code: 'admin',
        createdAt: '2026-03-24T09:23:44.499Z',
    },
    {
        _id: '2',
        name: 'staff',
        description: 'Nhân viên bán hàng',
        code: 'staff',
        createdAt: '2026-03-24T09:23:44.500Z',
    },
    {
        _id: '3',
        name: 'sale',
        description: 'Nhân viên kinh doanh',
        code: 'sale',
        createdAt: '2026-03-24T09:23:44.500Z',
    },
];

const getBadgeStyle = (code) => {
    switch (code) {
        case 'admin':
            return 'bg-red-100 text-red-700 border-red-200';
        case 'staff':
            return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'sale':
            return 'bg-green-100 text-green-700 border-green-200';
        default:
            return 'bg-gray-100 text-gray-600 border-gray-200';
    }
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
};

const ManageDepartment = () => {
    const [search, setSearch] = useState('');

    const filteredDepartments = useMemo(() => {
        return mockDepartments.filter((dep) => dep.description.toLowerCase().includes(search.toLowerCase()));
    }, [search]);

    return (
        <div className=" space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-semibold">Quản lý phòng ban</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="flex items-start gap-2 p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                        <span className="text-yellow-600 text-sm">⚠️</span>
                        <p className="text-sm text-blue-700">
                            Danh sách phòng ban được quản lý ở cấp hệ thống và hiện chỉ hỗ trợ
                            <span className="font-medium"> xem thông tin</span>.
                        </p>
                    </div>

                    {/* Search */}
                    <div className="flex items-center justify-between">
                        <Input
                            placeholder="Tìm kiếm theo tên phòng ban..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>

                    {/* Table */}
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr className="text-left text-gray-600">
                                    <th className="px-4 py-3">Tên</th>
                                    <th className="px-4 py-3">Mô tả</th>
                                    <th className="px-4 py-3">Code</th>
                                    <th className="px-4 py-3">Ngày tạo</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredDepartments.length > 0 ? (
                                    filteredDepartments.map((dep) => (
                                        <tr key={dep._id} className="border-t hover:bg-gray-50 transition">
                                            <td className="px-4 py-3 font-medium capitalize">{dep.name}</td>

                                            <td className="px-4 py-3 text-gray-600">{dep.description}</td>

                                            <td className="px-4 py-3">
                                                <Badge variant="outline" className={`${getBadgeStyle(dep.code)}`}>
                                                    {dep.code}
                                                </Badge>
                                            </td>

                                            <td className="px-4 py-3 text-gray-500">{formatDate(dep.createdAt)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-6 text-gray-400">
                                            Không có dữ liệu
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ManageDepartment;
