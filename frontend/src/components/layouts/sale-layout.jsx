import React from 'react';
import { Outlet } from 'react-router-dom';
const SaleLayout = () => {
    return (
        <div>
            <h1>Sale Layout o day</h1>
            <Outlet />
        </div>
    );
};

export default SaleLayout;
