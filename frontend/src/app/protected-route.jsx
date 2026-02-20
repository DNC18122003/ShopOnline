import { useContext } from 'react';
import { AuthContext } from '@/context/authContext';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();
    // nếu loading = true => app chưa chạy lần đầu, chưa tải data user chưa check role
    // nếu loading = false => app đã load user lần đầu, lúc này mới check để tránh flict UI
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>Loading...</p>
            </div>
        );
    }
    if (!user) {
        // Lưu lại vị trí trang hiện tại để sau khi login có thể quay lại
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    // console.log('user.role:', user.role); // customer
    // console.log('requiredRole:', requiredRole); // Customer
    if (requiredRole && user.role.trim().toLowerCase() !== requiredRole.trim().toLowerCase()) {
        return <Navigate to="/403_unauthorized" replace />;
    }
    return <>{children}</>;
};
export default ProtectedRoute;
