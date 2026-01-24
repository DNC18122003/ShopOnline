import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. Tạo Context
export const AuthContext = createContext(null);

// 2. Tạo Provider
export const AuthProvider = ({ children }) => {
    // State lưu thông tin user (null là chưa đăng nhập)
    const [user, setUser] = useState(null);

    const value = {
        user,
        setUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
