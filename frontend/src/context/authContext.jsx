import React, { createContext, useState, useContext, useEffect } from 'react';
import { getMe } from '@/services/auth/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    // console.log('user in authContext:', user);
    useEffect(() => {
        const fetchMe = async () => {
            //console.log('get me test');
            try {
                const res = await getMe();
                // res CHÍNH LÀ response.data
                //console.log('get me res:', res.data.user);
                setUser(res.data.user);
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
