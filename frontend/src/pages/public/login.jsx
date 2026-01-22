import React from 'react';
import { useNavigate } from 'react-router-dom';

import poster from '../../assets/techstore.png';
import { Cpu, Mail, Lock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toaster } from '@/components/ui/sonner';
import { login_service } from '../../services/authService';
const login = () => {
    const navigate = useNavigate();
    const [messageError, setMessageError] = React.useState('');
    const [formLogin, setFormLogin] = React.useState({
        email: '',
        password: '',
    });
    const handleChange = (e) => {
        setFormLogin({
            ...formLogin,
            [e.target.name]: e.target.value,
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await login_service(formLogin.email, formLogin.password);
            // console.log('Login successful api:', response.data);
            if (response.status === 200) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                alert('Login successful!');
                setTimeout(() => {
                    navigate('/');
                }, 1000);
            }
        } catch (error) {
            setMessageError(error.response.data.message);
            console.error('Login failed:', error);
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
                    <p className="text-gray-600 text-center text-sm mb-6">Đăng nhập để trải nghiệm mua sắm tuyệt vời</p>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* email */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute right-3 top-[50%] translate-y-[-50%] w-5 h-5 text-gray-400" />
                                <Input
                                    type="email"
                                    placeholder="Nhập địa chỉ email của bạn"
                                    name="email"
                                    value={formLogin.email}
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
                                    value={formLogin.password}
                                    onChange={handleChange}
                                    className=" border-gray-300 focus:border-blue-500 text-gray-900"
                                />
                            </div>
                        </div>
                        {/*  Forgot Password */}
                        <div className="flex items-center justify-end">
                            <a href="#" className="text-sm text-blue-500 hover:text-blue-600 font-medium">
                                Quên mật khẩu?
                            </a>
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-lg"
                        >
                            Đăng nhập
                        </Button>
                        {messageError && <p className="text-red-500 text-sm ">{messageError}</p>}
                    </form>

                    {/* Divider */}
                    <div className="flex items-center mt-5 ">
                        <div className="flex-1 border"></div>
                        <span className="mx-2 mb-1 text-gray-400">Hoặc</span>
                        <div className="flex-1 border"></div>
                    </div>
                    {/* Google login */}
                    <Button
                        variant="outline"
                        className="w-full border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50 bg-transparent first-letter:text-red-500"
                    >
                        <span className="text-red-500 font-bold mr-1 text-2xl ">G</span> Đăng nhập với Google
                    </Button>
                    {/* Sign Up Link */}
                    <div className="text-center mt-6">
                        <span className="text-gray-600 text-sm">
                            Chưa có tài khoản?{' '}
                            <a href="/register" className="text-blue-500 hover:text-blue-600 font-semibold">
                                Đăng ký ngay
                            </a>
                        </span>
                    </div>
                </div>
            </div>
            {/* right : image logo */}
            <div className="hidden lg:flex w-1/2 items-center justify-center">
                <img src={poster} alt="Poster website" className="h-screen " />
            </div>
        </div>
    );
};

export default login;
