import React from 'react';
import { Outlet } from 'react-router-dom';
import poster from '@/assets/tech_shop_poster.png';
const AuthLayout = () => {
    return (
        <div>
            <div className="flex h-screen w-full">
                {/* left : login form */}
                <div className=" bg-slate-300 w-full lg:w-1/2 flex items-center justify-center p-4">
                    <Outlet />
                </div>
                {/* right : image logo */}
                <div className="hidden lg:flex w-1/2 items-center justify-center">
                    <img src={poster} alt="Poster website" className="h-screen " />
                </div>
            </div>
            {/* <ToastContainer /> */}
        </div>
    );
};

export default AuthLayout;
