import { useContext } from 'react';
import { AuthContext } from '@/context/authContext';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading } = useContext(AuthContext);

    const location = useLocation();
    // nếu loading = true => app chưa chạy lần đầu, chưa tải data user chưa check role
    // nếu loading = false => app đã load user lần đầu, lúc này mới check để tránh flict UI
    //console.log('loading in protected route:', loading);
    if (loading) {
        //console.log('1');
        return (
            <div className="flex items-center justify-center h-screen">
                <p>Loading...</p>
            </div>
        );
    }
    //console.log('protect đi đến đây và có kết quả', user);
    if (!user) {
        //console.log('2');
        // Lưu lại vị trí trang hiện tại để sau khi login có thể quay lại
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    // Kiểm tra nếu user đã bị banned
    console.log('user.isActive:', user.isActive);
    if (user && user.isActive === 'banned') {
        console.log('4');
        return <Navigate to="/banned" replace />;
    }
    // Kiểm tra user đã active chưa
    if (user && user.isActive === 'inactive') {
        //console.log('3');
        return <Navigate to="/verify_otp" replace />;
    }

    // console.log('user.role:', user.role); // customer
    // console.log('requiredRole:', requiredRole); // Customer
    if (requiredRole && user.role.trim().toLowerCase() !== requiredRole.trim().toLowerCase()) {
        return <Navigate to="/403_unauthorized" replace />;
    }
    return <>{children}</>;
};
export default ProtectedRoute;
