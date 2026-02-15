import React, { useState } from 'react';
import { ShoppingCart, User, Search, Menu, X, Globe, LogOut } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { logoutUser } from '../../services/supabase/auth';

const Header = () => {
    const { cart, currentUser, searchQuery, setSearchQuery, setShowAuth, setCurrentPage, setCurrentUser, setSelectedCategory, settings } = useApp();

    const { language, toggleLanguage, t } = useLanguage();
    const [mobileMenu, setMobileMenu] = useState(false);

    return (
        <header className="sticky top-0 bg-white shadow-sm z-50 border-b border-gray-100">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <div className="flex items-center space-x-4 cursor-pointer" onClick={() => {
                        setCurrentPage('home');
                        setSelectedCategory(null);
                        setSearchQuery('');
                    }}>
                        <div className="w-14 h-14 flex items-center justify-center filter drop-shadow-md hover:scale-110 transition-transform duration-300">
                            <img src={settings.logo_url || "/favicon.svg"} alt={`${settings.site_name || 'Nuur Home'} Logo`} className="w-full h-full object-contain" />
                        </div>
                        <span className="text-xs md:text-xl font-serif text-gray-800 tracking-widest uppercase truncate max-w-[150px] md:max-w-none">
                            {settings.site_name || 'Nuur Home'}
                        </span>

                    </div>


                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
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
                                className="text-gray-700 hover:text-primary font-medium transition-colors capitalize"
                            >
                                {t(page) || page}
                            </button>
                        ))}
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center space-x-2 md:space-x-4">
                        {/* Language Toggle - Mobile: icon only, Desktop: icon + text */}
                        <button
                            onClick={toggleLanguage}
                            className="p-2 md:px-3 md:py-2 text-gray-600 hover:text-primary transition-colors flex items-center space-x-0 md:space-x-2 rounded-lg hover:bg-gray-50"
                        >
                            <Globe className="w-5 h-5" />
                            <span className="hidden md:inline text-sm font-medium">{language.toUpperCase()}</span>
                        </button>

                        {/* Cart */}
                        <button
                            onClick={() => setCurrentPage('cart')}
                            className="relative p-2 text-gray-700 hover:text-primary transition-colors"
                        >
                            <ShoppingCart className="w-6 h-6" />
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                    {cart.length}
                                </span>
                            )}
                        </button>

                        {/* User - Desktop with Dropdown */}
                        {currentUser ? (
                            <div className="hidden md:block relative group">
                                <button className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                                    <User className="w-5 h-5 text-gray-600" />
                                    <span className="text-sm font-medium text-gray-700">{currentUser.name || currentUser.email?.split('@')[0]}</span>
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
                                onClick={() => setShowAuth(true)}
                                className="hidden md:flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                            >
                                <User className="w-5 h-5" />
                                <span className="font-medium">{t('login') || 'Kirish'}</span>
                            </button>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden p-2 text-gray-700 hover:text-primary transition-colors"
                            onClick={() => setMobileMenu(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* SIMPLE Mobile Menu */}
            {mobileMenu && (
                <div className="fixed inset-0 z-[60] md:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setMobileMenu(false)}
                    />

                    {/* Menu Panel */}
                    <div className="absolute right-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl">
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
                                        className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg capitalize"
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
                                        setShowAuth(true);
                                        setMobileMenu(false);
                                    }}
                                    className="w-full py-3 bg-primary text-white rounded-lg font-bold mb-4"
                                >
                                    Kirish
                                </button>
                            )}

                            {/* Language */}
                            <div className="flex items-center justify-center space-x-2 py-2 text-gray-600">
                                <Globe className="w-5 h-5" />
                                <span>{language.toUpperCase()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;