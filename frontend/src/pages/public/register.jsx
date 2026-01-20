import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Cpu, Mail, User, Lock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import poster from '../../assets/tech_shop_poster.png';
import { register_service } from '../../services/authService';
const register = () => {
    const navigate = useNavigate();
    const [formRegister, setFormRegister] = React.useState({
        profileName: '',
        email: '',
        password: '',
    });
    const [messageError, setMessageError] = React.useState('');
    const handleChange = (e) => {
        setFormRegister({
            ...formRegister,
            [e.target.name]: e.target.value,
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Register form data:', formRegister);
        try {
            const response = await register_service(
                formRegister.profileName,
                formRegister.email,
                formRegister.password,
            );
            console.log('Register successful api:', response.data);
            if (response.status === 201) {
                alert('Register successful!');
                setTimeout(() => {
                    navigate('/login');
                }, 1000);
            }
        } catch (error) {
            setMessageError(error.response.data.message);
            console.error('Register failed:', error);
        }
    };
    return (
        <div className="flex h-screen w-full">
            {/* left : login form */}
            <div className=" bg-slate-300 w-full lg:w-1/2 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow">
                    {/* iCon */}
                    <div className="flex justify-center mb-5">
                        <Cpu className="text-blue-700 h-10 w-10" />
                    </div>
                    {/* Title */}
                    <h1 className="text-2xl font-bold text-blue-700 text-center mb-2">Chào mừng đến với TechShop</h1>
                    {/* Descrition */}
                    <p className="text-gray-600 text-center text-sm mb-6">
                        Đăng kí ngay để có trải nghiệm mua sắm tuyệt vời
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* profile name */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-2">Tên người dùng</label>
                            <div className="relative">
                                <User className="absolute right-3 top-[50%] translate-y-[-50%] w-5 h-5 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Nhập tên người dùng của bạn"
                                    name="profileName"
                                    value={formRegister.profileName}
                                    onChange={handleChange}
                                    className=" border-gray-300 focus:border-blue-500 text-gray-900"
                                />
                            </div>
                        </div>

                        {/* email */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute right-3 top-[50%] translate-y-[-50%] w-5 h-5 text-gray-400" />
                                <Input
                                    type="email"
                                    placeholder="Nhập địa chỉ email của bạn"
                                    name="email"
                                    value={formRegister.email}
                                    onChange={handleChange}
                                    className=" border-gray-300 focus:border-blue-500 text-gray-900"
                                />
                            </div>
                        </div>
                        {/* password */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-2">Mật khẩu</label>
                            <div className="relative">
                                <Lock className="absolute right-3 top-[50%] translate-y-[-50%] w-5 h-5 text-gray-400" />
                                <Input
                                    type="password"
                                    placeholder="Nhập mật khẩu của bạn"
                                    name="password"
                                    value={formRegister.password}
                                    onChange={handleChange}
                                    className=" border-gray-300 focus:border-blue-500 text-gray-900"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-lg"
                        >
                            Đăng ký
                        </Button>
                        {messageError && <p className="text-red-500 text-sm ">{messageError}</p>}
                    </form>
                </div>
            </div>
            {/* right : image logo */}
            <div className="hidden lg:flex w-1/2 items-center justify-center">
                <img src={poster} alt="Poster website" className="h-screen " />
            </div>
        </div>
    );
};

export default register;
