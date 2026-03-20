import { Briefcase, Plus, Shield, ShoppingCart, Users } from 'lucide-react';
import StatCard from '@/pages/admin/manageUser/component/StarCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';
import ManageCustomer from './component/ManageCustomer';
import ManageSale from './component/ManageSale';
import ManageAdmin from './component/ManageAdmin';
import ManageStaff from './component/ManageStaff';

import { getNumberOfAccount } from '@/services/account/account.api';
import { getTotalOrder } from '@/services/order/order.api';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import DialogAddEmployee from './component/DialogAddEmployee';

const ManageUserPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState('customers');
    const [totalOrders, setTotalOrders] = useState(0);
    const [numberOfAccount, setNumberOfAccount] = useState({
        totalCustomers: 0,
        totalSales: 0,
        totalStaffs: 0,
    });
    const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const resOrders = await getTotalOrder();
                setTotalOrders(resOrders.totalCompletedOrders);
                const resAccount = await getNumberOfAccount();
                setNumberOfAccount(resAccount.data);
            } catch (error) {
                console.log(error);
            }
        };
        fetchData();
    }, []);
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchParams({});
    };
    return (
        <div className="flex flex-1 flex-col gap-6">
            {/* Card */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Tổng số khách hàng"
                    value={numberOfAccount.totalCustomers}
                    description="Tổng số khách hàng"
                    icon={<Users className="h-4 w-4" />}
                />
                <StatCard
                    title="Tổng số đơn hàng"
                    value={totalOrders}
                    description="Tổng số đơn hàng"
                    icon={<ShoppingCart className="h-4 w-4" />}
                />
                <StatCard
                    title="Nhân viên bán hàng"
                    value={numberOfAccount.totalSales}
                    description="Tổng số nhân viên bán hàng"
                    icon={<Briefcase className="h-4 w-4" />}
                />
                <StatCard
                    title="Quản trị viên"
                    value={numberOfAccount.totalStaffs}
                    description="Tổng số quản trị viên"
                    icon={<Shield className="h-4 w-4" />}
                />
            </div>
            <div className="flex items-center justify-end">
                <Button variant="outline" onClick={() => setIsAddEmployeeOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm nhân viên
                </Button>
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
            <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
                <DialogContent className="">
                    <DialogAddEmployee />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ManageUserPage;
