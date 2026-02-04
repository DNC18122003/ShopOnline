import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { getProfile } from '@/services/customer/profile.api';

const UserProfile = () => {
    // State lưu trữ thông tin người dùng
    const [data, setData] = useState({
        userName: '',
        fullName: '',
        email: '',
        phoneNumber: '',
    });

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // getData
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getProfile();
                // console.log('Profile data fetched:', response.myProfile);
                setData({
                    ...data,
                    userName: response.myProfile?.userName || '',
                    fullName: response.myProfile?.fullName || '',
                    email: response.myProfile?.email || '',
                    phoneNumber: response.myProfile?.phoneNumber || '',
                });
            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        // For now, using static data
    }, []);
    // handle edit profile
    const handleEditProfile = () => {
        // Logic for editing profile
        setIsEditing(!isEditing);
    };

    if (loading) {
        return <div>Loading...</div>;
    }
    //console.log('Rendering UserProfile with data:', data.isActive)
    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Thông tin cá nhân</h1>
                <Button className="gap-2 bg-blue-500 text-white hover:bg-blue-600" onClick={handleEditProfile}>
                    <Pencil className="h-4 w-4" />
                    {isEditing ? 'Lưu' : 'Chỉnh sửa'}
                </Button>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-10">
                    <div>
                        <Label className="text-sm font-medium text-gray-600">Tên định danh</Label>
                        <Input
                            type="text"
                            className="mt-2 text-base text-gray-900 p-2 border border-gray-300 rounded"
                            value={data.userName}
                            readOnly={!isEditing}
                        />
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-gray-600">Tên đầy đủ</Label>
                        <Input
                            type="text"
                            className="mt-2 text-base text-gray-900 p-2 border border-gray-300 rounded"
                            value={data.fullName}
                            readOnly={!isEditing}
                        />
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-10">
                    <div>
                        <Label className="text-sm font-medium text-gray-600">Email</Label>
                        <Input
                            type="email"
                            className="mt-2 text-base text-gray-900 p-2 border border-gray-300 rounded"
                            value={data.email}
                            readOnly={!isEditing}
                        />
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-gray-600">Số điện thoại</Label>
                        <Input
                            type="text"
                            className="mt-2 text-base text-gray-900 p-2 border border-gray-300 rounded"
                            value={data.phoneNumber}
                            readOnly={!isEditing}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
