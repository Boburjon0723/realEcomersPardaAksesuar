import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

function getAdminEmailSet() {
    const raw = process.env.REACT_APP_ADMIN_EMAILS || '';
    return new Set(
        raw
            .split(',')
            .map((e) => e.trim().toLowerCase())
            .filter(Boolean)
    );
}

function userIsAdmin(user) {
    const email = user?.email?.toLowerCase().trim();
    if (!email) return false;
    return getAdminEmailSet().has(email);
}

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
                setIsAdmin(userIsAdmin(currentUser));
            }
            setLoading(false);
        };

        getInitialSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user || null;
            setUser(currentUser);
            if (currentUser) {
                setIsAdmin(userIsAdmin(currentUser));
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