import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { getProfile, updateProfileService } from '@/services/order/profile.api';
import { getAddress } from '@/services/order/order.api';
import { toast } from 'react-toastify';

const UserProfile = () => {
    // State lưu trữ thông tin người dùng
    const [data, setData] = useState({
        userName: '',
        fullName: '',
        email: '',
        phone: '',
        address: {
            street: '',
            ward: '',
            province: '',
        },
    });

    const [isEditing, setIsEditing] = useState(false);

    const [loading, setLoading] = useState(false);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [loadingLocation, setLoadingLocation] = useState(false);
    // getData
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getProfile();
                console.log('Profile data fetched:', response.myProfile?.phone); // log đươc data phone 1234456
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
    // handle change input address
    const handleChangeAddress = (e) => {
        setData({
            ...data,
            address: {
                ...data.address,
                [e.target.name]: e.target.value,
            },
        });
    };

    // handle upate
    const updateProfile = async () => {
        if (!isEditing) {
            return;
        }
        try {
            setLoadingUpdate(true);

            const dataToUpdate = {
                fullName: data.fullName.trim(),
                phone: data.phone.trim(),
                address: {
                    street: data.address.street.trim(),
                    ward: data.address.ward.trim(),
                    province: data.address.province.trim(),
                },
            };
            const response = await updateProfileService(dataToUpdate);
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
    // handle get current location
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Trình duyệt không hỗ trợ lấy vị trí');
            return;
        }

        setLoadingLocation(true);

        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                try {
                    const data = await getAddress({
                        lat: coords.latitude,
                        lon: coords.longitude,
                    });
                    // handle data to set form
                    console.log('Địa chỉ nhận được từ API:', data);
                    console.log('Địa chỉ hiện tại:', data.fullAddress);
                    console.log('Phường/Xã:', data.ward);
                    console.log('Tỉnh/Thành phố:', data.province);
                    setData((prev) => ({
                        ...prev,
                        address: {
                            ...prev.address,
                            street: data.fullAddress || '',
                            ward: data.ward || '',
                            province: data.province || '',
                        },
                    }));

                    toast.success('Lấy địa chỉ hiện tại thành công!', {
                        position: 'top-right',
                        autoClose: 4000,
                    });
                } catch (err) {
                    console.error('Lỗi khi lấy địa chỉ tự động:', err);
                    setError('Không thể lấy địa chỉ tự động. Vui lòng nhập thủ công.');
                    toast.error('Không thể lấy địa chỉ tự động.');
                } finally {
                    setLoadingLocation(false);
                }
            },
            (err) => {
                setLoadingLocation(false);
                const msg =
                    err.code === 1
                        ? 'Bạn đã từ chối chia sẻ vị trí.'
                        : 'Lỗi lấy vị trí. Vui lòng kiểm tra quyền truy cập.';
                toast.error(msg);
            },
            { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 },
        );
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
                            <Button onClick={getCurrentLocation} disabled={loadingLocation} className="">
                                {loadingLocation ? <>Đang lấy...</> : <>📍 Lấy địa chỉ hiện tại</>}
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
                        <div>
                            <Label className="text-sm font-medium text-gray-600">Tỉnh/Thành phố</Label>
                            <Input
                                type="text"
                                className="mt-2 text-base text-gray-900 p-2 border border-gray-300 rounded"
                                name="province"
                                onChange={handleChangeAddress}
                                value={data.address.province}
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
                        <div className="flex-1">
                            <Label className="text-sm font-medium text-gray-600">Xã/Phường</Label>
                            <Input
                                type="text"
                                className="mt-2 text-base text-gray-900 p-2 border border-gray-300 rounded"
                                name="ward"
                                onChange={handleChangeAddress}
                                value={data.address.ward}
                                readOnly={!isEditing}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-10">
                    <Label className="text-sm font-medium text-gray-600">Địa chỉ cụ thể </Label>
                    <Input
                        type="text"
                        className="mt-2 text-base text-gray-900 p-2 border border-gray-300 rounded"
                        name="address"
                        onChange={handleChange}
                        value={data.address.street}
                        readOnly={!isEditing}
                    />
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
