import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { getProfile, updateProfileService } from '@/services/customer/profile.api';
import { set } from 'date-fns';
import { toast } from 'react-toastify';

const UserProfile = () => {
    // State lưu trữ thông tin người dùng
    const [data, setData] = useState({
        userName: '',
        fullName: '',
        email: '',
        phone: '',
        adress: '',
    });

    const [isEditing, setIsEditing] = useState(false);

    const [loading, setLoading] = useState(false);
    const [loadingUpdate, setLoadingUpdate] = useState(false);

    // getData
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getProfile();
                // console.log('Profile data fetched:', response.myProfile?.phone); // log đươc data phone 1234456
                setData({
                    ...data,
                    userName: response.myProfile?.userName || '',
                    fullName: response.myProfile?.fullName || '',
                    email: response.myProfile?.email || '',
                    phone: response.myProfile?.phone || '',
                    address: response.myProfile?.address || '',
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

    const handleChange = (e) => {
        setData({
            ...data,
            [e.target.name]: e.target.value,
        });
    };

    // handle upate
    const updateProfile = async () => {
        if (!isEditing) {
            return;
        }
        try {
            setLoadingUpdate(true);
            const response = await updateProfileService(data);
            console.log('Profile updated:', response);
            setIsEditing(false);
            toast.success('Cập nhật thông tin cá nhân thành công');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.response?.data?.message || 'Cập nhật thông tin cá nhân thất bại');
        } finally {
            setLoadingUpdate(false);
        }
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
                <div className="flex items-center space-x-4">
                    {isEditing === false ? (
                        <Button
                            className="gap-2 bg-blue-500 text-white hover:bg-blue-600"
                            onClick={() => {
                                setIsEditing(true);
                            }}
                        >
                            <Pencil className="h-4 w-4" />
                            Chỉnh sửa
                        </Button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button
                                className="gap-2 bg-green-500 text-white hover:bg-green-600"
                                onClick={updateProfile}
                                disabled={loadingUpdate}
                            >
                                {loadingUpdate ? 'Đang lưu...' : 'Lưu'}
                            </Button>
                            <Button
                                className="gap-2 bg-red-500 text-white hover:bg-red-600"
                                onClick={() => {
                                    (setIsEditing(false),
                                        setData({
                                            ...data,
                                            fullName: '',
                                            phone: '',
                                            address: '',
                                        }));
                                }}
                            >
                                Hủy
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Grid */}
            <div>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    {/* Left Column */}
                    <div className="space-y-10">
                        <div>
                            <Label className="text-sm font-medium text-gray-600">Tên định danh</Label>
                            <Input
                                type="text"
                                className="mt-2 text-base text-gray-900 p-2 border border-gray-300 rounded"
                                value={data.userName}
                                readOnly
                            />
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-gray-600">Tên đầy đủ</Label>
                            <Input
                                type="text"
                                className="mt-2 text-base text-gray-900 p-2 border border-gray-300 rounded"
                                name="fullName"
                                value={data.fullName}
                                onChange={handleChange}
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
                                readOnly
                            />
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-gray-600">Số điện thoại</Label>
                            <Input
                                type="text"
                                className="mt-2 text-base text-gray-900 p-2 border border-gray-300 rounded"
                                name="phone"
                                onChange={handleChange}
                                value={data.phone}
                                readOnly={!isEditing}
                            />
                        </div>
                    </div>
                </div>
                <div className="mt-10">
                    <Label className="text-sm font-medium text-gray-600">Địa chỉ</Label>
                    <Input
                        type="text"
                        className="mt-2 text-base text-gray-900 p-2 border border-gray-300 rounded"
                        name="address"
                        onChange={handleChange}
                        value={data.address}
                        readOnly={!isEditing}
                    />
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
