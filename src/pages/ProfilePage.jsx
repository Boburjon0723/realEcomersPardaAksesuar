// ==========================================
// src/pages/ProfilePage.jsx - PROFIL SAHIFASI
// Yoqtirilganlar | Buyurtmalarim | Ko'rib chiqqanlar
// ==========================================
import React, { useState, useEffect } from 'react';
import { Heart, Package, Eye, ArrowLeft, ShoppingBag, ExternalLink, ChevronRight, MapPin, User, Settings, Lock } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { useLanguage } from '../contexts/LanguageContext';
import PageMeta from '../components/common/PageMeta';
import { getUserOrders } from '../services/supabase/orders';
import { getProductsByIds } from '../services/supabase/products';
import ProductGrid from '../components/product/ProductGrid';
import EditProfileModal from '../components/auth/EditProfileModal';
import ChangePasswordModal from '../components/auth/ChangePasswordModal';

const TABS = [
    { id: 'wishlist', icon: Heart, labelKey: 'wishlist' },
    { id: 'orders', icon: Package, labelKey: 'myOrders' },
    { id: 'recent', icon: Eye, labelKey: 'recentlyViewed' },
];

const ProfilePage = () => {
    const { currentUser, setCurrentPage, setCurrentUser, favorites, recentlyViewed, addToCart, language, settings } = useApp();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('wishlist');
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [profileToast, setProfileToast] = useState(null);
    const [orders, setOrders] = useState([]);
    const [wishlistProducts, setWishlistProducts] = useState([]);
    const [recentProducts, setRecentProducts] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [loadingWishlist, setLoadingWishlist] = useState(false);
    const [loadingRecent, setLoadingRecent] = useState(false);

    useEffect(() => {
        if (!currentUser) {
            setCurrentPage('home');
            return;
        }
    }, [currentUser, setCurrentPage]);

    useEffect(() => {
        if (activeTab === 'orders' && currentUser) {
            setLoadingOrders(true);
            getUserOrders(currentUser.id).then((res) => {
                if (res.success) setOrders(res.orders || []);
                setLoadingOrders(false);
            });
        }
    }, [activeTab, currentUser]);

    useEffect(() => {
        if (activeTab === 'wishlist' && favorites?.length > 0) {
            setLoadingWishlist(true);
            getProductsByIds(favorites).then((res) => {
                setWishlistProducts(res.success ? res.products : []);
                setLoadingWishlist(false);
            });
        } else {
            setWishlistProducts([]);
            setLoadingWishlist(false);
        }
    }, [activeTab, favorites]);

    useEffect(() => {
        if (activeTab === 'recent' && recentlyViewed?.length > 0) {
            setLoadingRecent(true);
            getProductsByIds(recentlyViewed).then((res) => {
                setRecentProducts(res.success ? res.products : []);
                setLoadingRecent(false);
            });
        } else {
            setRecentProducts([]);
            setLoadingRecent(false);
        }
    }, [activeTab, recentlyViewed]);

    const getStatusColor = (status) => {
        const colors = {
            new: 'bg-blue-100 text-blue-700',
            yangi: 'bg-blue-100 text-blue-700',
            pending: 'bg-yellow-100 text-yellow-700',
            jarayonda: 'bg-yellow-100 text-yellow-700',
            completed: 'bg-green-100 text-green-700',
            yakunlangan: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700',
            bekor_qilingan: 'bg-red-100 text-red-700',
        };
        return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(
            language === 'uz' ? 'uz-UZ' : language === 'ru' ? 'ru-RU' : 'en-US',
            { year: 'numeric', month: 'long', day: 'numeric' }
        );
    };

    const emptyMessages = {
        wishlist: language === 'uz'
            ? "Siz hali hech qanday mahsulotni yoqtirmagansiz. Do'konni ko'rib chiqing va yoqqan mahsulotlarni qo'shing."
            : language === 'ru'
                ? 'Вы еще не добавили товары в избранное. Посмотрите каталог и добавьте понравившиеся.'
                : "You haven't liked any products yet. Browse the shop and add your favorites.",
        recent: language === 'uz'
            ? "Siz hali hech qanday mahsulotni ko'rib chiqmagansiz."
            : language === 'ru'
                ? 'Вы еще не просматривали товары.'
                : "You haven't viewed any products yet.",
    };

    if (!currentUser) return null;

    return (
        <>
            <PageMeta title={t('profile')} description={t('metaDescProfile')} siteName={settings?.site_name} />
            <div className="container mx-auto px-4 md:px-6 py-12 max-w-6xl">
                <button
                    onClick={() => setCurrentPage('home')}
                    className="flex items-center text-gray-500 hover:text-primary mb-8 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    {t('backToShop')}
                </button>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar - User info + Tabs */}
                    <aside className="md:w-64 flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                    <User className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-900 truncate">{currentUser.name || currentUser.email?.split('@')[0]}</h2>
                                    <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                                    {currentUser.phone && (
                                        <p className="text-xs text-primary font-medium">{currentUser.phone}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <nav className="space-y-1">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                                        activeTab === tab.id ? 'bg-primary text-white shadow-md' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                                    }`}
                                >
                                    <tab.icon className="w-5 h-5 flex-shrink-0" />
                                    <span className="font-medium">{t(tab.labelKey)}</span>
                                    <ChevronRight className="w-4 h-4 ml-auto" />
                                </button>
                            ))}
                        </nav>

                        <button
                            onClick={() => setCurrentPage('orders')}
                            className="mt-4 w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
                        >
                            <ExternalLink className="w-4 h-5" />
                            <span className="font-medium">{t('viewAllOrders')}</span>
                        </button>
                    </aside>

                    {/* Content */}
                    <main className="flex-1 min-w-0">
                        {/* Wishlist Tab */}
                        {activeTab === 'wishlist' && (
                            <section>
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Heart className="w-6 h-6 text-red-500" />
                                    {t('wishlist')}
                                </h3>
                                {loadingWishlist ? (
                                    <ProductGrid products={[]} loading />
                                ) : wishlistProducts.length === 0 ? (
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                                        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-600 mb-6">{emptyMessages.wishlist}</p>
                                        <button
                                            onClick={() => setCurrentPage('shop')}
                                            className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90"
                                        >
                                            {t('shopNow')}
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-end mb-4">
                                            <button
                                                onClick={() => wishlistProducts.forEach((p) => addToCart(p))}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                                            >
                                                <ShoppingBag className="w-5 h-5" />
                                                {t('addAllToCart')}
                                            </button>
                                        </div>
                                        <ProductGrid products={wishlistProducts} />
                                    </>
                                )}
                            </section>
                        )}

                        {/* Orders Tab - Qisqacha */}
                        {activeTab === 'orders' && (
                            <section>
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Package className="w-6 h-6 text-primary" />
                                    {t('myOrders')}
                                </h3>
                                {loadingOrders ? (
                                    <div className="flex justify-center py-16">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-600 mb-6">
                                            {language === 'uz' ? "Siz hali buyurtma bermagansiz." : language === 'ru' ? 'Вы еще не делали заказов.' : "You haven't placed any orders yet."}
                                        </p>
                                        <button
                                            onClick={() => setCurrentPage('shop')}
                                            className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90"
                                        >
                                            {t('shopNow')}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.slice(0, 5).map((order) => (
                                            <div
                                                key={order.id}
                                                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <div>
                                                        <span className="text-xs text-gray-500 font-mono">#{order.id?.slice(0, 8).toUpperCase()}</span>
                                                        <p className="text-sm text-gray-600 mt-0.5">{formatDate(order.created_at)}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                                                            {t(order.status?.toLowerCase()) || order.status}
                                                        </span>
                                                        <span className="font-bold text-primary">${Number(order.totalAmount || order.total || 0).toLocaleString()}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => setCurrentPage('orders')}
                                                        className="text-primary text-sm font-bold hover:underline flex items-center gap-1"
                                                    >
                                                        {t('viewDetails')} <ExternalLink className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                {order.products?.slice(0, 2).map((item, idx) => (
                                                    <div key={idx} className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2 text-sm text-gray-500">
                                                        <img src={item.image || '/favicon.svg'} alt="" className="w-8 h-8 rounded object-cover" />
                                                        <span className="truncate">
                                                            {typeof item.name === 'object' ? item.name[language] || item.name.uz : item.name}
                                                        </span>
                                                        <span>Ã—{item.quantity}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                        {orders.length > 5 && (
                                            <button
                                                onClick={() => setCurrentPage('orders')}
                                                className="w-full py-3 border border-primary text-primary rounded-xl font-bold hover:bg-primary/5"
                                            >
                                                {t('viewAllOrders')} ({orders.length})
                                            </button>
                                        )}
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Recent Tab */}
                        {activeTab === 'recent' && (
                            <section>
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Eye className="w-6 h-6 text-primary" />
                                    {t('recentlyViewed')}
                                </h3>
                                {loadingRecent ? (
                                    <ProductGrid products={[]} loading />
                                ) : recentProducts.length === 0 ? (
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                                        <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-600 mb-6">{emptyMessages.recent}</p>
                                        <button
                                            onClick={() => setCurrentPage('shop')}
                                            className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90"
                                        >
                                            {t('shopNow')}
                                        </button>
                                    </div>
                                ) : (
                                    <ProductGrid products={recentProducts} />
                                )}
                            </section>
                        )}
                    </main>
                </div>

                {/* Profil sozlamalari - dinamik */}
                <div className="mt-12 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-primary" />
                        {t('profileSettings') || 'Profil sozlamalari'}
                    </h4>
                    <div className="space-y-2">
                        <button
                            onClick={() => {
                                setProfileToast(t('comingSoon'));
                                setTimeout(() => setProfileToast(null), 3000);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-gray-700 hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                        >
                            <MapPin className="w-5 h-5 text-primary shrink-0" />
                            <span className="font-medium">{t('savedAddresses') || "Manzillar ro'yxati"}</span>
                            <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                        </button>
                        <button
                            onClick={() => setShowEditProfile(true)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-gray-700 hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                        >
                            <User className="w-5 h-5 text-primary shrink-0" />
                            <span className="font-medium">{t('editProfile') || "Profilni tahrirlash"}</span>
                            <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                        </button>
                        <button
                            onClick={() => setShowChangePassword(true)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-gray-700 hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                        >
                            <Lock className="w-5 h-5 text-primary shrink-0" />
                            <span className="font-medium">{t('changePassword') || "Parolni o'zgartirish"}</span>
                            <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                        </button>
                        <button
                            onClick={async () => {
                                if (!favorites?.length) {
                                    setProfileToast(language === 'uz' ? "Avval sevimlilarga mahsulot qo'shing" : language === 'ru' ? 'Сначала добавьте товары в избранное' : 'Add products to wishlist first');
                                    setTimeout(() => setProfileToast(''), 3000);
                                    return;
                                }
                                const res = await getProductsByIds(favorites);
                                if (res.success && res.products?.length) {
                                    res.products.forEach((p) => addToCart(p));
                                    setProfileToast(t('addAllToCartSuccess') || t('addAllToCart'));
                                    setTimeout(() => setProfileToast(''), 3000);
                                }
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-gray-700 hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                        >
                            <ShoppingBag className="w-5 h-5 text-primary shrink-0" />
                            <span className="font-medium">{t('quickAddWishlist') || "Yoqtirilganlarni savatga qo'shish"}</span>
                            <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                        </button>
                    </div>
                </div>

                {profileToast && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-medium shadow-lg animate-fade-in">
                        {profileToast}
                    </div>
                )}

                {showEditProfile && (
                    <EditProfileModal
                        user={currentUser}
                        onClose={() => setShowEditProfile(false)}
                        onSuccess={(updated) => {
                            if (updated) setCurrentUser(updated);
                            localStorage.setItem('user', JSON.stringify(updated));
                        }}
                    />
                )}
                {showChangePassword && (
                    <ChangePasswordModal
                        onClose={() => setShowChangePassword(false)}
                        onSuccess={() => setShowChangePassword(false)}
                    />
                )}
            </div>
        </>
    );
};

export default ProfilePage;
