import React, { createContext, useState, useContext, useEffect } from 'react';
import { getMe } from '@/services/auth/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMe = async () => {
            try {
                const res = await getMe();
                // res CHÍNH LÀ response.data
                setUser(res.user ?? res);
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchMe();
    }, []);

    return <AuthContext.Provider value={{ user, setUser, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth phải được dùng bên trong AuthProvider');
    }
    return context;
};
