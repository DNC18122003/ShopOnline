import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Cpu, Mail, User, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import poster from '../../assets/tech_shop_poster.png';
import { register_service } from '../../services/authService';
import { toast } from 'react-toastify';
const register = () => {
    const navigate = useNavigate();
    const [formRegister, setFormRegister] = React.useState({
        userName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [messageError, setMessageError] = React.useState({});
    const [loadingLogin, setLoadingLogin] = React.useState(false);
    const handleChange = (e) => {
        setFormRegister({
            ...formRegister,
            [e.target.name]: e.target.value,
        });
    };
    const validateForm = (form) => {
        const errors = {};
        // validate user name
        if (!form.userName) {
            errors.userNameError = 'Profile name is required';
        } else {
            errors.userNameError = '';
        }
        // validate email
        if (!form.email) {
            errors.emailError = 'Địa chỉ email không được để trống !';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(form.email)) {
            errors.emailError = 'Địa chỉ email không hợp lệ !';
        } else {
            errors.emailError = '';
        }
        // validate password
        if (!form.password || form.password.length < 8) {
            errors.passwordError = 'Mật khẩu cần tối thiểu 8 kí tự !';
        } else {
            errors.passwordError = '';
        }
        // validate confirm password
        if (form.password !== form.confirmPassword) {
            errors.confirmPasswordError = 'Mật khẩu và xác nhận mật khẩu không khớp !';
        }
        return errors;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateForm(formRegister);
        setMessageError(errors);
        if (errors.userNameError || errors.emailError || errors.passwordError) {
            return;
        }
        // console.log('Register form data:', formRegister);
        try {
            setLoadingLogin(true);
            const response = await register_service(formRegister.userName, formRegister.email, formRegister.password);
            // console.log('Register successful api:', response.data);
            if (response.status === 201) {
                toast.success('Register successful!');
                setTimeout(() => {
                    navigate('/login');
                }, 1000);
            }
        } catch (error) {
            toast.error(error.response.data.message);
            console.error('Register failed:', error);
        } finally {
            setLoadingLogin(false);
        }
    };
    return (
        <div className="flex h-screen w-full">
            {/* left : login form */}
            <div className=" bg-slate-300 w-full lg:w-1/2 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow">
                    {/* back to login */}
                    <ArrowLeft className="text-blue-700 hover:bg-gray-50" onClick={() => navigate('/login')} />
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
                                    name="userName"
                                    value={formRegister.userName}
                                    onChange={handleChange}
                                    className=" border-gray-300 focus:border-blue-500 text-gray-900"
                                />
                            </div>
                            {messageError?.userNameError && (
                                <p className="text-red-500 text-sm mt-1">{messageError.userNameError}</p>
                            )}
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
                            {messageError?.emailError && (
                                <p className="text-red-500 text-sm mt-1">{messageError.emailError}</p>
                            )}
                        </div>
                        {/* password */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-2">Mật khẩu</label>
                            <Input
                                type="password"
                                placeholder="Nhập mật khẩu của bạn"
                                name="password"
                                value={formRegister.password}
                                onChange={handleChange}
                                className=" border-gray-300 focus:border-blue-500 text-gray-900 "
                            />
                            {messageError?.passwordError && (
                                <p className="text-red-500 text-sm mt-1">{messageError.passwordError}</p>
                            )}
                        </div>
                        {/* confirm password */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-2">Xác nhận mật khẩu</label>
                            <Input
                                type="password"
                                placeholder="Xác nhận mật khẩu của bạn"
                                name="confirmPassword"
                                value={formRegister.confirmPassword}
                                onChange={handleChange}
                                className=" border-gray-300 focus:border-blue-500 text-gray-900 "
                            />
                            {messageError?.confirmPasswordError && (
                                <p className="text-red-500 text-sm mt-1">{messageError.confirmPasswordError}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={loadingLogin}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-lg"
                        >
                            Đăng ký
                        </Button>
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
