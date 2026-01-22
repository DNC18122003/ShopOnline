import React from 'react';
import Header from '../public/header';
import Footer from '../public/footer';
import { Outlet } from 'react-router-dom';
const UserLayout = () => {
    return (
        <div>
            <Header />
            <Outlet />
            <Footer />
        </div>
    );
};

export default UserLayout;
