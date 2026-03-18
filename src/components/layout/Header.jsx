import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, User, Search, Menu, X, Globe, LogOut, Package, ChevronDown } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { logoutUser } from '../../services/supabase/auth';

const LANGUAGES = [
    { code: 'uz', label: "O'zbekcha" },
    { code: 'ru', label: 'Русский' },
    { code: 'en', label: 'English' }
];

const Header = () => {
    const { cart, currentUser, currentPage, searchQuery, setSearchQuery, setShowAuth, setIsLogin, setCurrentPage, setCurrentUser, setSelectedCategory, settings } = useApp();
    const { language, changeLanguage, t } = useLanguage();
    const [showLangDropdown, setShowLangDropdown] = useState(false);
    const langDropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
                setShowLangDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isNavActive = (page) => {
        if (page === 'shop') return currentPage === 'shop' || currentPage === 'product';
        return currentPage === page;
    };

    const currentPageLabel = {
        cart: t('cart'),
        checkout: t('checkout') || "To'lov",
        orders: t('myOrders'),
        profile: t('profile'),
        shipping: t('shipping'),
        returns: t('returns'),
        faq: t('faq'),
        terms: t('terms'),
        privacy: t('privacy')
    }[currentPage];
    const [mobileMenu, setMobileMenu] = useState(false);

    return (
        <header className="sticky top-0 bg-white shadow-sm z-50 border-b border-gray-100">
            <div className="container mx-auto px-6 md:px-8 lg:px-12">
                <div className="flex items-center justify-between h-14 md:h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-2 md:gap-3 cursor-pointer" onClick={() => {
                        setCurrentPage('home');
                        setSelectedCategory(null);
                        setSearchQuery('');
                    }}>
                        <div className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center filter drop-shadow-md hover:scale-105 transition-transform duration-300">
                            <img src={settings.logo_url || "/favicon.svg"} alt={`${settings.site_name || 'Nuur Home'} Logo`} className="w-full h-full object-contain" />
                        </div>
                        <span className="text-[11px] md:text-sm font-serif text-gray-800 tracking-wider uppercase whitespace-nowrap">
                            {settings.site_name || 'Nuur Home'}
                        </span>

                    </div>

                    {/* Current page indicator (sub-pages) */}
                    {currentPageLabel && (
                        <div className="hidden md:flex items-center">
                            <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-lg">
                                {currentPageLabel}
                            </span>
                        </div>
                    )}

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-5">
                        {['home', 'shop', 'about', 'contact'].map((page) => (
                            <button
                                key={page}
                                onClick={() => {
                                    setCurrentPage(page);
                                    if (page === 'home') {
                                        setSelectedCategory(null);
                                        setSearchQuery('');
                                    }
                                }}
                                className={`text-sm font-medium transition-colors capitalize px-2 py-1 rounded-lg ${isNavActive(page)
                                    ? 'text-primary bg-primary/10'
                                    : 'text-gray-700 hover:text-primary hover:bg-gray-50'}`}
                            >
                                {t(page) || page}
                            </button>
                        ))}
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center gap-1 md:gap-2">
                        {/* Language Switcher - bosganda til ro'yxati */}
                        <div className="relative" ref={langDropdownRef}>
                            <button
                                onClick={() => setShowLangDropdown(!showLangDropdown)}
                                className="p-2 md:px-3 md:py-2 text-gray-600 hover:text-primary transition-colors flex items-center gap-1.5 rounded-lg hover:bg-gray-50 min-w-[100px] md:min-w-[120px] justify-between"
                            >
                                <span className="flex items-center gap-1.5">
                                    <Globe className="w-4 h-4 text-primary" />
                                    <span className="hidden md:inline text-xs font-medium">{LANGUAGES.find(l => l.code === language)?.label || language.toUpperCase()}</span>
                                </span>
                                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showLangDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            {showLangDropdown && (
                                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                                    {LANGUAGES.map(({ code, label }) => (
                                        <button
                                            key={code}
                                            onClick={() => { changeLanguage(code); setShowLangDropdown(false); }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${language === code ? 'text-primary font-bold' : 'text-gray-700'}`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Cart */}
                        <button
                            onClick={() => setCurrentPage('cart')}
                            className="relative p-2 text-gray-700 hover:text-primary transition-colors"
                        >
                            <ShoppingCart className="w-5 h-5 md:w-5 md:h-5" />
                            {cart.length > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                    {cart.length}
                                </span>
                            )}
                        </button>

                        {/* User - Desktop with Dropdown */}
                        {currentUser ? (
                            <div className="hidden md:block relative group">
                                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                                    <User className="w-4 h-4 text-gray-600" />
                                    <span className="text-xs font-medium text-gray-700 truncate max-w-[100px]">{currentUser.name || currentUser.email?.split('@')[0]}</span>
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown Menu */}
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                    <div className="p-3 border-b border-gray-100">
                                        <p className="text-sm font-bold text-gray-900 truncate">{currentUser.name}</p>
                                        <p className="text-xs text-secondary font-bold truncate">{currentUser.phone}</p>
                                    </div>
                                    <div className="p-2">
                                        <button
                                            onClick={() => setCurrentPage('profile')}
                                            className="w-full flex items-center space-x-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                            <User className="w-4 h-4" />
                                            <span className="text-sm font-medium">{t('profile') || 'Profilim'}</span>
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage('orders')}
                                            className="w-full flex items-center space-x-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                            <Package className="w-4 h-4" />
                                            <span className="text-sm font-medium">{t('myOrders') || 'Mening buyurtmalarim'}</span>
                                        </button>
                                        <button
                                            onClick={async () => {
                                                await logoutUser();
                                                setCurrentUser(null);
                                                localStorage.removeItem('user');
                                                window.location.reload();
                                            }}
                                            className="w-full flex items-center space-x-2 px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span className="text-sm font-medium">{t('logout') || 'Chiqish'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => { setIsLogin(false); setShowAuth(true); }}
                                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
                            >
                                <User className="w-4 h-4" />
                                <span className="font-medium">{t('profile') || 'Profilim'}</span>
                            </button>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden p-2 text-gray-700 hover:text-primary transition-colors"
                            onClick={() => setMobileMenu(true)}
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* SIMPLE Mobile Menu */}
            {mobileMenu && (
                <div className="fixed inset-0 z-[60] md:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 animate-mobile-backdrop-in"
                        onClick={() => setMobileMenu(false)}
                    />

                    {/* Menu Panel */}
                    <div className="absolute right-0 top-0 bottom-0 w-[280px] max-w-[85vw] bg-white shadow-2xl animate-mobile-menu-in">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-bold">Menu</h3>
                            <button onClick={() => setMobileMenu(false)} className="p-2">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content - Scrollable */}
                        <div className="overflow-y-auto h-[calc(100vh-60px)] p-4">
                            {/* Search */}
                            <div className="mb-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Qidirish..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg"
                                    />
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="space-y-2 mb-6">
                                <p className="text-xs text-gray-500 uppercase px-2 mb-2">Sahifalar</p>
                                {['home', 'shop', 'about', 'contact'].map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => {
                                            setCurrentPage(page);
                                            if (page === 'home') {
                                                setSelectedCategory(null);
                                                setSearchQuery('');
                                            }
                                            setMobileMenu(false);
                                        }}
                                        className={`w-full text-left px-4 py-3 rounded-lg capitalize ${isNavActive(page)
                                            ? 'bg-primary/10 text-primary font-semibold'
                                            : 'hover:bg-gray-100'}`}
                                    >
                                        {t(page) || page}
                                    </button>
                                ))}
                            </div>

                            {/* User Section */}
                            {currentUser ? (
                                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                                    <p className="font-bold mb-1">{currentUser.name}</p>
                                    <p className="text-sm text-secondary font-bold mb-3">{currentUser.phone}</p>
                                    <button
                                        onClick={() => {
                                            setCurrentPage('profile');
                                            setMobileMenu(false);
                                        }}
                                        className="w-full py-2 bg-white border border-gray-200 text-gray-800 rounded-lg text-sm mb-2 font-bold"
                                    >
                                        {t('profile') || 'Profilim'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setCurrentPage('orders');
                                            setMobileMenu(false);
                                        }}
                                        className="w-full py-2 bg-white border border-gray-200 text-gray-800 rounded-lg text-sm mb-2 font-bold"
                                    >
                                        {t('myOrders') || 'Mening buyurtmalarim'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            logoutUser();
                                            setCurrentUser(null);
                                            localStorage.removeItem('user');
                                            setMobileMenu(false);
                                            window.location.reload();
                                        }}
                                        className="w-full py-2 bg-red-500 text-white rounded-lg text-sm"
                                    >
                                        Chiqish
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => {
                                        setIsLogin(false);
                                        setShowAuth(true);
                                        setMobileMenu(false);
                                    }}
                                    className="w-full py-3 bg-primary text-white rounded-lg font-bold mb-4"
                                >
                                    {t('profile') || 'Profilim'}
                                </button>
                            )}

                            {/* Til tanlash */}
                            <div className="border-t pt-4 mt-4">
                                <p className="text-xs text-gray-500 uppercase px-2 mb-2 flex items-center gap-2">
                                    <Globe className="w-4 h-4" />
                                    Til
                                </p>
                                <div className="space-y-1">
                                    {LANGUAGES.map(({ code, label }) => (
                                        <button
                                            key={code}
                                            onClick={() => { changeLanguage(code); setMobileMenu(false); }}
                                            className={`w-full text-left px-4 py-3 rounded-lg text-sm ${language === code ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-gray-100 text-gray-700'}`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;