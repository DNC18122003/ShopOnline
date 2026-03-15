import { Briefcase, Shield, ShoppingCart, Users } from 'lucide-react';
import StatCard from '@/pages/admin/manageUser/component/StarCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import ManageCustomer from './component/ManageCustomer';
import ManageSale from './component/ManageSale';
import ManageAdmin from './component/ManageAdmin';
import ManageStaff from './component/ManageStaff';

const stats = [
    {
        title: 'Tổng số khách hàng',
        value: 20,
        description: 'Tổng số khách hàng đã đăng ký',
        icon: <ShoppingCart className="h-4 w-4" />,
    },
    {
        title: 'Tổng số đơn hàng',
        value: 30,
        description: 'Tổng số đơn hàng',
        icon: <Users className="h-4 w-4" />,
    },
    {
        title: 'Tổng số nhân viên',
        value: 25,
        description: 'Tổng số nhân viên',
        icon: <Briefcase className="h-4 w-4" />,
    },
    {
        title: 'Tổng số quản trị viên',
        value: 5,
        description: 'Tổng số quản trị viên',
        icon: <Shield className="h-4 w-4" />,
    },
];
const ManageUserPage = () => {
    const [activeTab, setActiveTab] = useState('customers');

    return (
        <div className="flex flex-1 flex-col gap-6">
            {/* Card */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <StatCard key={stat.title} {...stat} />
                ))}
            </div>
            {/* Tabs Section */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-fit">
                    <TabsTrigger value="customers">Customers</TabsTrigger>
                    <TabsTrigger value="sales">Sales</TabsTrigger>
                    <TabsTrigger value="staff">Staff</TabsTrigger>
                    <TabsTrigger value="admins">Admins</TabsTrigger>
                </TabsList>

                <TabsContent value="customers" className="space-y-4">
                    <ManageCustomer />
                </TabsContent>

                <TabsContent value="sales" className="space-y-4">
                    <ManageSale />
                </TabsContent>

                <TabsContent value="staff" className="space-y-4">
                    <ManageStaff />
                </TabsContent>

                <TabsContent value="admins" className="space-y-4">
                    <ManageAdmin />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ManageUserPage;
