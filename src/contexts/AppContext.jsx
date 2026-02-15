import React, { createContext, useState, useEffect, useContext } from 'react';
import { getSettings } from '../services/supabase/settings';
import { supabase } from '../supabaseClient';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [cart, setCart] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [currentPage, setCurrentPage] = useState('home');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showAuth, setShowAuth] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [settings, setSettings] = useState({
        site_name: 'Nuur Home',
        logo_url: '/favicon.svg',
        phone: '',
        address: '',
        work_hours: '',
        telegram_url: '',
        instagram_url: '',
        facebook_url: ''
    });

    // LocalStorage dan yuklash va Settings yuklash
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        const savedFavorites = localStorage.getItem('favorites');

        if (savedCart) setCart(JSON.parse(savedCart));
        if (savedFavorites) setFavorites(JSON.parse(savedFavorites));

        // Get initial Supabase session
        const getInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                // Construct a user object that mimics what the UI expects
                const user = {
                    id: session.user.id,
                    email: session.user.email,
                    name: session.user.user_metadata?.name || session.user.user_metadata?.display_name || session.user.email?.split('@')[0],
                    phone: session.user.user_metadata?.phone || '',
                    ...session.user.user_metadata
                };
                setCurrentUser(user);
                localStorage.setItem('user', JSON.stringify(user));
            } else {
                // If no session but we have something in localStorage, keep it for UI 
                // but real auth actions might still fail. 
                // Better to clear if no real session exists.
                // const savedUser = localStorage.getItem('user');
                // if (savedUser) setCurrentUser(JSON.parse(savedUser));
            }
        };

        getInitialSession();

        // Listen for Supabase auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                const user = {
                    id: session.user.id,
                    email: session.user.email,
                    name: session.user.user_metadata?.name || session.user.user_metadata?.display_name || session.user.email?.split('@')[0],
                    phone: session.user.user_metadata?.phone || '',
                    ...session.user.user_metadata
                };
                setCurrentUser(user);
                localStorage.setItem('user', JSON.stringify(user));
            } else if (event === 'SIGNED_OUT') {
                setCurrentUser(null);
                localStorage.removeItem('user');
            }
        });

        const fetchSettings = async () => {
            const result = await getSettings();
            if (result.success) {
                setSettings(result.settings);
            }
        };
        fetchSettings();

        return () => subscription.unsubscribe();
    }, []);

    // LocalStorage ga saqlash
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }, [favorites]);

    // Cart functions
    const addToCart = (product, quantity = 1, selectedColor = null) => {
        setCart(prev => {
            const colorToUse = selectedColor || product.color || (product.colors && product.colors[0]);
            const cartItemId = `${product.id}-${colorToUse || 'default'}`;

            const existing = prev.find(item => item.cartItemId === cartItemId);
            if (existing) {
                return prev.map(item =>
                    item.cartItemId === cartItemId
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { ...product, quantity, selectedColor: colorToUse, cartItemId }];
        });
    };

    const removeFromCart = (cartItemId) => {
        setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
    };

    const updateQuantity = (cartItemId, quantity) => {
        if (quantity < 1) return;
        setCart(prev =>
            prev.map(item =>
                item.cartItemId === cartItemId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const calculatePrice = (product, quantity) => {
        if (!product || !product.priceRanges) return product?.price || 0;
        const range = product.priceRanges.find(r => quantity >= r.min && quantity <= r.max);
        const discount = range ? range.discount : 0;
        return product.price * (1 - discount / 100);
    };

    const getTotalPrice = () => {
        return cart.reduce((total, item) => {
            return total + calculatePrice(item, item.quantity) * item.quantity;
        }, 0);
    };

    const getCartCount = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    // Favorites functions
    const toggleFavorite = (productId) => {
        setFavorites(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const isFavorite = (productId) => {
        return favorites.includes(productId);
    };

    const value = {
        currentUser,
        setCurrentUser,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        calculatePrice,
        getTotalPrice,
        getCartCount,
        favorites,
        toggleFavorite,
        isFavorite,
        currentPage,
        setCurrentPage,
        selectedProduct,
        setSelectedProduct,
        showAuth,
        setShowAuth,
        isLogin,
        setIsLogin,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        settings,
        setSettings
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
};
