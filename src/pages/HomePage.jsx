import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import ProductGrid from '../components/product/ProductGrid';
import { getAllProducts } from '../services/supabase/products';
import { getActiveBanners } from '../services/supabase/banners';
import { getAllCategories } from '../services/supabase/categories';
import { supabase } from '../supabaseClient';
import { Truck, ShieldCheck, CreditCard, ArrowRight, X } from 'lucide-react';

const HomePage = () => {
    const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, setCurrentPage, settings } = useApp();
    const { language, t } = useLanguage();
    const [products, setProducts] = useState([]);
    const [banners, setBanners] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

    const carouselImages = [
        '/images/hero/hero1.jpg',
        '/images/hero/hero2.jpg',
        '/images/hero/hero3.jpg'
    ];

    useEffect(() => {
        // Carousel Timer
        const heroTimer = setInterval(() => {
            setCurrentHeroSlide(prev => (prev + 1) % carouselImages.length);
        }, 5000);

        const fetchData = async () => {
            setLoading(true);
            const [productsResult, bannersResult, categoriesResult] = await Promise.all([
                getAllProducts(true),
                getActiveBanners(),
                getAllCategories()
            ]);

            if (productsResult.success) setProducts(productsResult.products);
            if (bannersResult.success) setBanners(bannersResult.banners);
            if (categoriesResult.success) {
                // Map categories to match display structure
                const mappedCategories = categoriesResult.categories.map(cat => ({
                    ...cat,
                    image: cat.image_url || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                    count: productsResult.products ? productsResult.products.filter(p => p.category_id === cat.id || p.category === cat.name).length : 0
                }));
                setCategories(mappedCategories);
            }
            setLoading(false);
        };
        fetchData();

        return () => clearInterval(heroTimer);
    }, []);

    // Helper for category navigation
    const handleCategoryClick = (catName) => {
        setSelectedCategory({ category: catName, subcategory: null });
        setCurrentPage('shop');
        window.scrollTo(0, 0);
    };

    // Filter products
    const filteredProducts = products.filter(product => {
        const name = product.name?.[language] || '';
        const category = product.category?.[language] || '';
        const subcategory = product.subcategory?.[language] || '';

        const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategory ||
            (category === selectedCategory.category &&
                (!selectedCategory.subcategory || subcategory === selectedCategory.subcategory));
        return matchesSearch && matchesCategory;
    });

    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    const handleSubscribe = async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        if (!email) return;

        try {
            const { error } = await supabase
                .from('newsletter_subscriptions')
                .insert([{ email }]);

            if (error) {
                if (error.code === '23505') {
                    setNotification({
                        show: true,
                        message: t('alreadySubscribed'),
                        type: 'info'
                    });
                } else {
                    throw error;
                }
            } else {
                setNotification({
                    show: true,
                    message: t('subscribeSuccess'),
                    type: 'success'
                });
                e.target.reset();
            }

            // Auto hide notification after 5 seconds
            setTimeout(() => {
                setNotification(prev => ({ ...prev, show: false }));
            }, 5000);

        } catch (error) {
            console.error('Subscription error:', error);
            setNotification({
                show: true,
                message: 'Xatolik yuz berdi. Keyinroq qayta urinib ko\'ring.',
                type: 'error'
            });
            setTimeout(() => {
                setNotification(prev => ({ ...prev, show: false }));
            }, 5000);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="pb-16 font-sans">
            {/* Premium Notification Popup */}
            {notification.show && (
                <div className="fixed top-24 right-4 z-[9999] pointer-events-none">
                    <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-b-4 backdrop-blur-xl pointer-events-auto transition-all duration-500 animate-in fade-in slide-in-from-right-10 ${notification.type === 'success' ? 'bg-white/95 border-green-500' :
                        notification.type === 'info' ? 'bg-white/95 border-blue-500' :
                            'bg-white/95 border-red-500'
                        }`}>
                        <div className={`p-3 rounded-xl ${notification.type === 'success' ? 'bg-green-100 text-green-600' :
                            notification.type === 'info' ? 'bg-blue-100 text-blue-600' :
                                'bg-red-100 text-red-600'
                            }`}>
                            <ShieldCheck size={24} className={notification.type === 'success' ? 'animate-bounce' : ''} />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 mb-0.5">Xabarnoma</p>
                            <p className="font-extrabold text-[#1a1a1a] text-sm leading-tight">{notification.message}</p>
                        </div>
                        <button
                            onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors group"
                        >
                            <X size={18} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
                        </button>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            {!selectedCategory && !searchQuery ? (
                <div className="relative bg-[#f6f4f2] h-[450px] md:h-[650px] flex items-center mb-16 overflow-hidden">
                    {/* Carousel Background */}
                    <div className="absolute inset-0 z-0">
                        {carouselImages.map((src, index) => (
                            <div
                                key={index}
                                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentHeroSlide ? 'opacity-100' : 'opacity-0'}`}
                            >
                                <img
                                    src={src}
                                    alt={`Hero ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                        <div className="absolute inset-0 bg-black/5"></div>
                    </div>

                    <div className="container mx-auto px-4 md:px-6 relative z-10 text-gray-900">
                        <div className="max-w-2xl animate-fade-in">
                            {/* Slide Indicators */}
                            <div className="flex gap-2 mb-8">
                                {carouselImages.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${index === currentHeroSlide ? 'w-10 bg-primary' : 'w-4 bg-gray-300'}`}
                                    />
                                ))}
                            </div>
                            <span className="inline-block py-1.5 px-3.5 bg-primary/10 border border-primary/20 rounded-full text-sm font-bold mb-6 text-primary">
                                {t('premiumQuality')}
                            </span>
                            <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight mb-6 text-gray-900">
                                {settings?.[`banner_text_${language}`] || settings?.banner_text || banners[0]?.[`title_${language}`] || banners[0]?.title || t('heroTitle')}
                            </h1>
                            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-xl">
                                {banners[0]?.[`subtitle_${language}`] || banners[0]?.subtitle || t('heroSubtitle')}
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={() => setCurrentPage('shop')}
                                    className="px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-all shadow-xl hover:shadow-primary/30 flex items-center group"
                                >
                                    {t('shopNow')}
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={() => setCurrentPage('shop')}
                                    className="px-8 py-4 bg-white/50 hover:bg-white/80 backdrop-blur-md text-gray-900 border border-gray-200 rounded-xl font-bold transition-all shadow-sm"
                                >
                                    {t('viewCatalog')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            <div className="container mx-auto px-4 md:px-6">

                {/* Benefits Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 border-b border-gray-100 pb-12">
                    <div className="flex items-center space-x-4 p-6 bg-gray-50 rounded-xl hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary shadow-sm border border-gray-100">
                            <Truck className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">{t('fastDelivery')}</h3>
                            <p className="text-sm text-gray-500">{t('freeDeliveryDesc')}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 p-6 bg-gray-50 rounded-xl hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary shadow-sm border border-gray-100">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">{t('qualityGuarantee')}</h3>
                            <p className="text-sm text-gray-500">{t('warrantyDesc')}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 p-6 bg-gray-50 rounded-xl hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary shadow-sm border border-gray-100">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">{t('securePayment')}</h3>
                            <p className="text-sm text-gray-500">{t('easyPaymentDesc')}</p>
                        </div>
                    </div>
                </div>

                {/* Shop by Category */}
                {!selectedCategory && !searchQuery && (
                    <section className="mb-20">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
                            <div>
                                <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs mb-2 block">{t('categories')}</span>
                                <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 tracking-tight">{t('shopByCategory')}</h2>
                            </div>
                            <button
                                onClick={() => setCurrentPage('shop')}
                                className="text-gray-900 hover:text-primary font-bold flex items-center text-sm group transition-colors"
                            >
                                {t('viewAll')} <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {categories.map((cat, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleCategoryClick(cat.name)}
                                    className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500"
                                >
                                    <img
                                        src={cat.image}
                                        alt={cat.name}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity group-hover:opacity-80"></div>
                                    <div className="absolute bottom-6 left-6 z-10">
                                        <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20 shadow-lg transition-transform group-hover:scale-105">
                                            <h3 className="text-lg font-bold text-gray-900 tracking-tight">{cat[`name_${language}`] || cat.name}</h3>
                                            <p className="text-xs text-gray-500 font-semibold">{cat.count} {t('items')}</p>
                                        </div>
                                    </div>
                                    <div className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                        <ArrowRight size={20} className="text-white" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Filter Status */}
                {(selectedCategory || searchQuery) && (
                    <div className="mb-8 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {searchQuery ? `${t('search')}: "${searchQuery}"` : (categories.find(c => c.name === selectedCategory.category)?.[`name_${language}`] || selectedCategory.category)}
                        </h2>
                        {selectedCategory && (
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className="text-red-500 hover:text-red-700 font-medium text-sm"
                            >
                                {t('clearFilters')}
                            </button>
                        )}
                    </div>
                )}

                {/* Best Sellers / Products */}
                <section className="mb-16">
                    <div className="flex justify-between items-center mb-10">
                        <div className="text-center w-full">
                            <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">{t('bestSellers')}</h2>
                            <p className="text-gray-500 max-w-2xl mx-auto">{t('aboutSubtitle')}</p>
                        </div>
                    </div>

                    {filteredProducts.length > 0 ? (
                        <ProductGrid products={filteredProducts} />
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-xl">
                            <p className="text-gray-500 text-lg">{t('noProducts')}</p>
                            <button
                                onClick={() => { setSelectedCategory(null); setSearchQuery(''); }}
                                className="mt-4 text-primary font-medium hover:underline"
                            >
                                {t('clearFilters')}
                            </button>
                        </div>
                    )}
                </section>

                {/* Newsletter / Promo Banner */}
                {!selectedCategory && !searchQuery && (
                    <section className="relative rounded-2xl overflow-hidden bg-primary text-white py-16 px-8 md:px-16 mb-16">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark to-primary opacity-90"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 animate-fade-in">
                            <div className="max-w-xl">
                                <h2 className="text-3xl font-display font-bold mb-4">{t('joinCommunity')}</h2>
                                <p className="text-white/80 text-lg">{t('subscribeDesc')}</p>
                            </div>
                            <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-2">
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    placeholder={t('email')}
                                    className="px-6 py-4 rounded-lg text-gray-900 w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-secondary"
                                />
                                <button type="submit" className="bg-secondary hover:bg-yellow-500 text-white px-8 py-4 rounded-lg font-bold transition-colors">
                                    {t('subscribe')}
                                </button>
                            </form>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default HomePage;
