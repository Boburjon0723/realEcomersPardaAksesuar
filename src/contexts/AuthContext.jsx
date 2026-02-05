import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Get initial session
        const getInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const currentUser = session?.user || null;
            setUser(currentUser);
            if (currentUser) {
                const adminEmails = process.env.REACT_APP_ADMIN_EMAILS?.split(',') || [];
                setIsAdmin(adminEmails.includes(currentUser.email));
            }
            setLoading(false);
        };

        getInitialSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user || null;
            setUser(currentUser);
            if (currentUser) {
                const adminEmails = process.env.REACT_APP_ADMIN_EMAILS?.split(',') || [];
                setIsAdmin(adminEmails.includes(currentUser.email));
            } else {
                setIsAdmin(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const value = {
        user,
        loading,
        isAdmin
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};