import React from 'react';
import { Outlet } from 'react-router-dom';
import poster from '@/assets/tech_shop_poster.png';
import Header from '@/components/public/header';
import Footer from '@/components/public/footer';

const AuthLayout = () => {
    return (
        <div className="flex flex-col h-screen w-full">
            <Header />
            <div className="flex-1 flex">
                {/* left : login form */}
                <div className=" bg-slate-300 w-full lg:w-1/2 flex items-center justify-center p-4">
                    <Outlet />
                </div>
                {/* right : image logo */}
                <div className="hidden lg:flex w-1/2 items-center justify-center">
                    <img src={poster} alt="Poster website" className="h-screen " />
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default AuthLayout;
