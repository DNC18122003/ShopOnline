import React from 'react';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
const SaleLayout = () => {
    return (
        <div className="h-screen w-full bg-gray-50 overflow-hidden">
            {/* header */}
            <div className="bg-white  p-5 border flex gap-3">
                <p>Logo</p>
                {/* tiêu đề hộp thoại */}
                <h1 className="">Tiêu đề hạng mục ....</h1>
            </div>
            <div className="flex gap-5 h-full ">
                {/* siderbar */}
                <aside className="bg-white w-60 p-5 border-r">
                    <ul>
                        <li>Dashboard</li>
                        <li>Quản lý nhân viên</li>
                        <li>Quản lý đơn hàng</li>
                        <li>Quản lý sản phẩm</li>
                        <li>Thống kê doanh thu</li>
                    </ul>
                    <button className="">Đăng xuất</button>
                </aside>
                {/* main */}
                <main className="flex-1 max-h-screen overflow-y-auto">
                    <div className=" bg-white  rounded-lg pt-2 ps-5 mt-5 border">
                        <Outlet />
                        {/* {Array.from({ length: 50 }).map((_, index) => (
                            <p key={index}>Nội dung chính của trang nhân viên - dòng {index + 1}</p>
                        ))} */}
                    </div>
                </main>
            </div>
            {/* Toast */}
            <ToastContainer />
        </div>
    );
};

export default SaleLayout;
