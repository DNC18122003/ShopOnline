import React from 'react';
import Header from '../public/header';
import Footer from '../public/footer';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
const UserLayout = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 bg-gray-50">
                <Outlet />
            </main>
            <Footer />
            <ToastContainer />
        </div>
    );
};

export default UserLayout;
