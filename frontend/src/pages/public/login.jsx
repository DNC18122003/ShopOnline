import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/authContext';
import { useCart } from '@/context/cartContext';
import { Cpu, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';

import poster from '../../assets/tech_shop_poster.png';

import { login_service } from '../../services/auth/authService';
const login = () => {
    const navigate = useNavigate();
    const { setUser } = useContext(AuthContext);
    const { fetchCart } = useCart(); 
    const [formLogin, setFormLogin] = React.useState({
        email: '',
        password: '',
    });
    const [messageError, setMessageError] = React.useState({});
    const [loadingLogin, setLoadingLogin] = React.useState(false);
    const handleChange = (e) => {
        setFormLogin({
            ...formLogin,
            [e.target.name]: e.target.value,
        });
    };
    const validateForm = (form) => {
        const errors = {};
        if (!form.email) {
            errors.emailError = 'Địa chỉ email không được để trống !';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(form.email)) {
            errors.emailError = 'Địa chỉ email không hợp lệ !';
        } else {
            errors.emailError = '';
        }
        if (!form.password || form.password.length < 8) {
            errors.passwordError = 'Mật khẩu cần tối thiểu 8 kí tự !';
        } else {
            errors.passwordError = '';
        }
        return errors;
    };
    const handleSubmit = async (e) => {
        console.log('start');
        e.preventDefault();
        const errors = validateForm(formLogin);
        setMessageError(errors);

        if (errors.emailError || errors.passwordError) {
            console.log('flow 1.1');
            return;
        }
        try {
            setLoadingLogin(true);
            console.log('start 1');
            const response = await login_service(formLogin.email, formLogin.password);
            console.log('Login successful api:', response);
            console.log('start 2');
            // set data in auth context
            setUser(response.user);
             await fetchCart();
            // set data in local storage
            const data_ui = {
                fullName: response.user.fullName,
                email: response.user.email,
                userName: response.user.userName,
                avatar: response.user.avatar,
            };
            localStorage.setItem('data_ui', JSON.stringify(data_ui));
            console.log('start 3');
            // alert('Login successful!');
            toast.success('Đăng nhập thành công, chào ' + response.user.userName);
            console.log('start 4');
            setTimeout(() => {
                navigate('/');
            }, 1000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Đăng nhập thất bại!');
            console.error('Login failed:', error);
        } finally {
            setLoadingLogin(false);
        }
    };
    return (
        <div className="flex h-screen w-full">
            {/* left : login form */}
            <div className=" bg-slate-300 w-full lg:w-1/2 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow">
                    {/* Logo */}
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
                                value={formLogin.password}
                                onChange={handleChange}
                                className=" border-gray-300 focus:border-blue-500 text-gray-900"
                            />
                            {messageError?.passwordError && (
                                <p className="text-red-500 text-sm mt-1">{messageError.passwordError}</p>
                            )}
                        </div>
                        {/*  Forgot Password */}
                        <div className="flex items-center justify-end">
                            <a href="#" className="text-sm text-blue-500 hover:text-blue-600 font-medium">
                                Quên mật khẩu?
                            </a>
                        </div>
                        <Button
                            type="submit"
                            disabled={loadingLogin}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-lg"
                        >
                            Đăng nhập
                        </Button>
                        {messageError && typeof messageError === 'string' && (
                            <p className="text-red-500 text-sm">{messageError}</p>
                        )}
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
                            <Link to="/register" className="text-blue-500 hover:text-blue-600 font-semibold">
                                Đăng ký ngay
                            </Link>
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
