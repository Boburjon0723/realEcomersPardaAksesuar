import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../hooks/useApp';
import { useLanguage } from '../contexts/LanguageContext';
import PageMeta from '../components/common/PageMeta';
import ProductGrid from '../components/product/ProductGrid';
import RecentlyViewedProducts from '../components/product/RecentlyViewedProducts';
import { getAllProducts } from '../services/supabase/products';
import { getActiveBanners } from '../services/supabase/banners';
import { getAllCategories } from '../services/supabase/categories';
import { getSiteBenefits } from '../services/supabase/siteBenefits';
import { supabase } from '../supabaseClient';
import { Truck, ShieldCheck, CreditCard, ArrowRight, X, Package, Headphones, Award, Zap } from 'lucide-react';

const ICON_MAP = {
    truck: Truck,
    'shield-check': ShieldCheck,
    'credit-card': CreditCard,
    package: Package,
    headphones: Headphones,
    award: Award,
    zap: Zap
};
// Fallback rasmlar â€“ DB bo'sh bo'lsa public/images/hero dan ishlatiladi
const FALLBACK_HERO_IMAGES = [
    '/images/hero/hero1.jpg',
    '/images/hero/hero2.jpg',
    '/images/hero/hero3.jpg',
];

const HomePage = () => {
    const { searchQuery, selectedCategory, setSelectedCategory, setCurrentPage, settings } = useApp();
    const { language, t } = useLanguage();
    const [products, setProducts] = useState([]);
    const [banners, setBanners] = useState([]);
    const [categories, setCategories] = useState([]);
    const [benefits, setBenefits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Hero slides: Supabase bannersdan yoki fallback
    const heroSlides = useMemo(() => {
        if (banners && banners.length > 0) {
            return banners.map(b => ({
                image: b.image_url || b.image || FALLBACK_HERO_IMAGES[0],
                title: b[`title_${language}`] || b.title || t('heroTitle'),
                subtitle: b[`subtitle_${language}`] || b.subtitle || null,
            }));
        }
        return FALLBACK_HERO_IMAGES.map((img) => ({
            image: img,
            title: settings?.[`banner_text_${language}`] || settings?.banner_text || t('heroTitle'),
            subtitle: null,
        }));
    }, [banners, language, settings, t]);

    const slideCount = heroSlides.length;

    // Carousel timer va swipe handler
    useEffect(() => {
        if (slideCount === 0) return;
        const heroTimer = setInterval(() => {
            setCurrentHeroSlide(prev => (prev + 1) % slideCount);
        }, 5000);
        return () => clearInterval(heroTimer);
    }, [slideCount]);

    const goToSlide = useCallback((index) => {
        if (index >= 0 && index < slideCount) setCurrentHeroSlide(index);
    }, [slideCount]);

    const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
    const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const diff = touchStart - touchEnd;
        if (Math.abs(diff) > 50) {
            if (diff > 0) goToSlide((currentHeroSlide + 1) % slideCount);
            else goToSlide(currentHeroSlide === 0 ? slideCount - 1 : currentHeroSlide - 1);
        }
        setTouchStart(null);
        setTouchEnd(null);
    };

    const fetchData = async () => {
        setLoading(true);
        const [productsResult, bannersResult, categoriesResult, benefitsResult] = await Promise.all([
            getAllProducts(true),
            getActiveBanners(),
            getAllCategories(),
            getSiteBenefits()
        ]);

        if (productsResult.success) setProducts(productsResult.products);
        if (bannersResult.success) setBanners(bannersResult.banners);
        if (benefitsResult.success) setBenefits(benefitsResult.benefits || []);
        if (categoriesResult.success) {
            const mappedCategories = categoriesResult.categories.map(cat => ({
                ...cat,
                image: cat.image_url || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                count: productsResult.products ? productsResult.products.filter(p => p.category_id === cat.id || p.category === cat.name).length : 0
            }));
            setCategories(mappedCategories);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Helper for category navigation
    const handleCategoryClick = (catName) => {
        setSelectedCategory({ category: catName, subcategory: null });
        setCurrentPage('shop');
        window.scrollTo(0, 0);
    };

    // Best Sellers: har bir kategoriyadan max 4 ta mahsulot (4 ustunli grid uchun)
    const bestSellersByCategory = useMemo(() => {
        const PER_CATEGORY = 4;
        const grouped = {};
        products.forEach((p) => {
            const key = p.category_id || (typeof p.category === 'object' ? (p.category?.name || p.category?.name_uz) : p.category) || 'uncategorized';
            if (!grouped[key]) grouped[key] = [];
            if (grouped[key].length < PER_CATEGORY) grouped[key].push(p);
        });
        return Object.entries(grouped)
            .filter(([, items]) => items.length > 0)
            .map(([catKey, items]) => {
                const cat = categories.find(c => c.id === catKey || c.name === catKey);
                const categoryKey = cat?.name || items[0]?.categories?.name || catKey;
                const categoryDisplayName = cat?.[`name_${language}`] || cat?.name || items[0]?.categories?.name || (typeof items[0]?.category === 'object' ? items[0]?.category?.[`name_${language}`] : items[0]?.category) || catKey;
                return { categoryKey, categoryDisplayName, products: items };
            });
    }, [products, categories, language]);

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

    return (
        <>
            <PageMeta title={t('home')} description={t('metaDescHome')} siteName={settings?.site_name} />
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

            {/* Hero Section - Banners jadvalidan yoki fallback (max-w-6xl bilan ikki yonidan qisqartirilgan) */}
            {!selectedCategory && !searchQuery && slideCount > 0 ? (
                <div className="max-w-6xl mx-auto px-6 md:px-8 lg:px-12 mb-16">
                    <div
                        className="relative bg-[#f6f4f2] h-[350px] sm:h-[420px] md:h-[550px] lg:h-[600px] flex items-center overflow-hidden select-none rounded-2xl shadow-xl"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                    {/* Carousel rasmlar */}
                    <div className="absolute inset-0 z-0">
                        {heroSlides.map((slide, index) => (
                            <div
                                key={index}
                                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentHeroSlide ? 'opacity-100' : 'opacity-0'}`}
                            >
                                <img
                                    src={slide.image}
                                    alt={`${slide.title}`}
                                    loading={index === 0 ? 'eager' : 'lazy'}
                                    className={`w-full h-full object-cover ${index === 0 ? 'object-[center_25%]' : ''}`}
                                />
                            </div>
                        ))}
                        <div className="absolute inset-0 bg-black/40" />
                    </div>

                    <div className="container mx-auto px-4 md:px-6 relative z-10">
                        <div className="max-w-2xl">
                            {/* Slide indikatorlar - click bilan */}
                            <div className="flex gap-2 mb-6 md:mb-8">
                                {heroSlides.map((_, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => goToSlide(index)}
                                        aria-label={`Slide ${index + 1}`}
                                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${index === currentHeroSlide ? 'w-10 bg-white' : 'w-4 bg-white/50 hover:bg-white/70'}`}
                                    />
                                ))}
                            </div>
                            <span className="inline-block py-1.5 px-3.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-sm font-bold mb-4 md:mb-6 text-white">
                                {t('premiumQuality')}
                            </span>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold leading-snug mb-6 md:mb-8 text-white drop-shadow-lg whitespace-pre-line">
                                {heroSlides[currentHeroSlide]?.title || t('heroTitle')}
                            </h1>
                            {heroSlides[currentHeroSlide]?.subtitle && (
                                <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 md:mb-8 leading-relaxed max-w-2xl drop-shadow-md whitespace-pre-line">
                                    {heroSlides[currentHeroSlide].subtitle}
                                </p>
                            )}
                            <div className="flex flex-wrap gap-3 md:gap-4">
                                <button
                                    onClick={() => setCurrentPage('shop')}
                                    className="px-6 py-3 md:px-8 md:py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-all shadow-xl hover:shadow-primary/30 flex items-center group"
                                >
                                    {t('shopNow')}
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={() => setCurrentPage('contact')}
                                    className="px-6 py-3 md:px-8 md:py-4 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/40 rounded-xl font-bold transition-all"
                                >
                                    {t('contactUs') || t('contact')}
                                </button>
                            </div>
                        </div>
                    </div>
                    </div>
                </div>
            ) : null}

            <div className="max-w-6xl mx-auto px-6 md:px-8 lg:px-12">

                {/* Benefits Section - CRM dan boshqariladi */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 border-b border-gray-100 pb-12">
                    {loading ? (
                        [1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center space-x-4 p-6 bg-gray-50 rounded-xl animate-pulse">
                                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                    <div className="h-3 bg-gray-100 rounded w-full" />
                                </div>
                            </div>
                        ))
                    ) : benefits.length > 0 ? benefits.map((b) => {
                        const IconComp = ICON_MAP[b.icon] || Truck;
                        const title = b[`title_${language}`] || b.title_uz || b.title_ru || b.title_en || '';
                        const desc = b[`desc_${language}`] || b.desc_uz || b.desc_ru || b.desc_en || '';
                        return (
                            <div key={b.id} className="flex items-center space-x-4 p-6 bg-gray-50 rounded-xl hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary shadow-sm border border-gray-100">
                                    <IconComp className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{title}</h3>
                                    <p className="text-sm text-gray-500">{desc}</p>
                                </div>
                            </div>
                        );
                    }) : (
                        <>
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
                        </>
                    )}
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
                                        loading="lazy"
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

                {/* Recently Viewed */}
                <RecentlyViewedProducts />

                {/* Best Sellers - Har bir kategoriyadan 4 ta mahsulot */}
                <section className="mb-20">
                    <div className="text-center mb-12">
                        <span className="inline-block text-primary font-bold tracking-[0.2em] uppercase text-xs mb-3">{t('bestSellers')}</span>
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-3">{t('bestSellers')}</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto text-base">{t('aboutSubtitle')}</p>
                    </div>

                    {loading ? (
                        <ProductGrid products={[]} loading={true} />
                    ) : bestSellersByCategory.length > 0 ? (
                        <div className="space-y-14">
                            {bestSellersByCategory.map(({ categoryKey, categoryDisplayName, products: catProducts }) => (
                                <div key={categoryKey} className="rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-bold text-gray-900 capitalize">{categoryDisplayName}</h3>
                                            <button
                                                onClick={() => handleCategoryClick(categoryKey)}
                                                className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 group"
                                            >
                                                {t('viewAll') || 'Barchasini ko\'rish'}
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <ProductGrid products={catProducts} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
                            <p className="text-gray-500 text-lg">{t('noProducts')}</p>
                            <button
                                onClick={() => setCurrentPage('shop')}
                                className="mt-4 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90"
                            >
                                {t('shopNow')}
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
        </>
    );
};

export default HomePage;
