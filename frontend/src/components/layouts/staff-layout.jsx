import React from 'react';
import { Outlet } from 'react-router-dom';
const StaffLayout = () => {
    return (
        <div>
            <h1>Đây là outlet cua staff Layout</h1>
            <Outlet />
        </div>
    );
};

export default StaffLayout;
