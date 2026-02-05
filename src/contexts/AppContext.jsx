import React, { createContext, useState, useEffect, useContext } from 'react';
import { getSettings } from '../services/supabase/settings';

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
        site_name: 'TechGear',
        logo_url: '',
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
        const savedUser = localStorage.getItem('user');
        const savedFavorites = localStorage.getItem('favorites');

        if (savedCart) setCart(JSON.parse(savedCart));
        if (savedUser) setCurrentUser(JSON.parse(savedUser));
        if (savedFavorites) setFavorites(JSON.parse(savedFavorites));

        const fetchSettings = async () => {
            const result = await getSettings();
            if (result.success) {
                setSettings(result.settings);
            }
        };
        fetchSettings();
    }, []);

    // LocalStorage ga saqlash
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }, [favorites]);

    // Cart functions
    const addToCart = (product, quantity = 1) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { ...product, quantity }];
        });
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) return;
        setCart(prev =>
            prev.map(item =>
                item.id === productId ? { ...item, quantity } : item
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
