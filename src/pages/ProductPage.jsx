import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Minus, Plus, Heart, ShieldCheck, ArrowLeft, CheckCircle, X, ShoppingCart, RotateCw, Share2 } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { useLanguage } from '../contexts/LanguageContext';
import PageMeta from '../components/common/PageMeta';
import Breadcrumb from '../components/common/Breadcrumb';
import ProductGallery from '../components/product/ProductGallery';
import ThreeSixtyViewer from '../components/product/ThreeSixtyViewer';
import { getAllColors, getProductById } from '../services/supabase/products';
import { supabase } from '../supabaseClient';
import { getShareableUrl } from '../utils/siteUrl';
import { formatPriceUSDWithUnit } from '../utils/price';
import { Box } from 'lucide-react';

const applyColorTo3DModel = (modelViewer, selectedColor, colorMap) => {
    if (!modelViewer?.model?.materials || !selectedColor || !colorMap[selectedColor]) return;
    const hexColor = colorMap[selectedColor];
    const r = parseInt(hexColor.slice(1, 3), 16) / 255;
    const g = parseInt(hexColor.slice(3, 5), 16) / 255;
    const b = parseInt(hexColor.slice(5, 7), 16) / 255;
    const color = [r, g, b, 1.0];
    modelViewer.model.materials.forEach(material => {
        material.pbrMetallicRoughness?.setBaseColorFactor(color);
    });
};

const ProductPage = () => {
    const { productId } = useParams();
    const { selectedProduct, setSelectedProduct, currentUser, addToCart, setCurrentPage, setSelectedCategory, addToRecentlyViewed, toggleFavorite, isFavorite, settings } = useApp();
    const [loadingProduct, setLoadingProduct] = useState(true);
    const [loadError, setLoadError] = useState(false);

    useEffect(() => {
        if (!productId) {
            setLoadingProduct(false);
            setLoadError(true);
            return;
        }
        if (String(selectedProduct?.id) === String(productId)) {
            setLoadingProduct(false);
            setLoadError(false);
            return;
        }
        let cancelled = false;
        (async () => {
            setLoadingProduct(true);
            setLoadError(false);
            const res = await getProductById(productId);
            if (cancelled) return;
            if (res.success && res.product) {
                setSelectedProduct(res.product);
                setLoadError(false);
            } else {
                setSelectedProduct(null);
                setLoadError(true);
            }
            setLoadingProduct(false);
        })();
        return () => {
            cancelled = true;
        };
    }, [productId, selectedProduct?.id, setSelectedProduct]);
    const { language, t, translateColor } = useLanguage();
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [reviews, setReviews] = useState([]);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [submitStatus, setSubmitStatus] = useState('idle'); // idle, submitting, success, error
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const [selectedColor, setSelectedColor] = useState(null);
    const [bulkQuantities, setBulkQuantities] = useState({});
    const [showBulkOrder, setShowBulkOrder] = useState(false);
    const [viewMode, setViewMode] = useState(selectedProduct?.model_3d_url ? '3d' : 'image');
    const [, setShareCopied] = useState(false);
    const [colorMap, setColorMap] = useState({});

    const modelViewerRef = React.useRef(null);
    const selectedColorRef = React.useRef(null);
    const colorMapRef = React.useRef({});

    React.useEffect(() => {
        selectedColorRef.current = selectedColor;
        colorMapRef.current = colorMap;
    }, [selectedColor, colorMap]);

    React.useEffect(() => {
        if (selectedProduct?.id) addToRecentlyViewed(selectedProduct.id);
    }, [selectedProduct?.id, addToRecentlyViewed]);

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 5000);
    };

    const handleShare = async () => {
        const productName = selectedProduct?.[`name_${language}`] || selectedProduct?.name || '';
        const url = getShareableUrl();

        if (navigator.share) {
            try {
                await navigator.share({
                    title: productName,
                    text: productName,
                    url
                });
                showNotification(t('shareSuccess') || 'Ulashildi!', 'success');
            } catch (err) {
                if (err.name !== 'AbortError') {
                    copyToClipboard(url);
                }
            }
        } else {
            copyToClipboard(url);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            setShareCopied(true);
            showNotification(t('linkCopied') || "Havola nusxalandi!", 'success');
            setTimeout(() => setShareCopied(false), 2000);
        }).catch(() => {
            const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(text)}`;
            window.open(tgUrl, '_blank', 'width=600,height=400');
        });
    };

    const fetchReviews = React.useCallback(async () => {
        const pid = selectedProduct?.id;
        if (!pid) {
            setReviews([]);
            return;
        }
        const idStr = String(pid);
        // Avvalo auth_users bog'lanishi bilan (agar Supabase FK/embed ishlamasa — xato beradi)
        let { data, error } = await supabase
            .from('reviews')
            .select('*, auth_users(email)')
            .eq('product_id', idStr)
            .eq('status', 'approved')
            .order('created_at', { ascending: false });
        if (error) {
            const fallback = await supabase
                .from('reviews')
                .select('*')
                .eq('product_id', idStr)
                .eq('status', 'approved')
                .order('created_at', { ascending: false });
            data = fallback.data;
            error = fallback.error;
        }
        if (error) {
            console.error('[reviews] fetch', error);
            setReviews([]);
            return;
        }
        setReviews(data || []);
    }, [selectedProduct?.id]);

    React.useEffect(() => {
        const fetchColors = async () => {
            const result = await getAllColors();
            if (result.success) {
                const map = {};
                result.colors.forEach(c => map[c.name] = c.hex_code);
                setColorMap(map);
            }
        };
        fetchColors();

        if (selectedProduct?.id) {
            setReviews([]);
            fetchReviews();
            // Reset selected color and bulk quantities when product changes
            setSelectedColor(selectedProduct.colors?.[0] || selectedProduct.color || null);

            const initialBulk = {};
            if (selectedProduct.colors?.length > 0) {
                selectedProduct.colors.forEach(c => initialBulk[c] = 0);
            }
            setBulkQuantities(initialBulk);
            setShowBulkOrder(false);
            if (selectedProduct.model_3d_url) setViewMode('3d');
            else setViewMode('image');
        }
    }, [selectedProduct?.id, selectedProduct?.color, selectedProduct?.colors, selectedProduct?.model_3d_url, fetchReviews]);

    // Update 3D model color when selectedColor changes or when model loads
    React.useEffect(() => {
        if (viewMode !== '3d' || !selectedColor || !colorMap[selectedColor]) return;
        const modelViewer = modelViewerRef.current || document.querySelector('model-viewer');
        if (!modelViewer) return;

        const apply = () => applyColorTo3DModel(modelViewer, selectedColorRef.current, colorMapRef.current);
        apply();
        modelViewer.addEventListener('load', apply);
        return () => modelViewer.removeEventListener('load', apply);
    }, [selectedColor, viewMode, colorMap]);

    // Dynamic Rating Calculation (selectedProduct hali null bo'lishi mumkin — loading / topilmadi)
    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
        : (selectedProduct?.rating ?? 0);

    const reviewsCount = reviews.length > 0 ? reviews.length : (selectedProduct?.reviews ?? 0);

    const handleSubmitReview = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            showNotification(t('loginToReview'), 'error');
            return;
        }

        setSubmitStatus('submitting');
        const { error } = await supabase.from('reviews').insert([
            {
                product_id: String(selectedProduct.id),
                user_id: currentUser.id,
                rating: reviewForm.rating,
                comment: reviewForm.comment,
                status: 'approved' // Set to approved by default as requested
            }
        ]);

        if (error) {
            console.error('Supabase Review Insert Error:', error);
            setSubmitStatus('error');
            showNotification(t('error') || 'Xatolik yuz berdi', 'error');
        } else {
            setSubmitStatus('success');
            setReviewForm({ rating: 5, comment: '' });
            fetchReviews(); // Refresh reviews immediately
            showNotification(t('reviewSubmitted'));
            setTimeout(() => setSubmitStatus('idle'), 5000);
        }
    };

    if (loadingProduct) {
        return (
            <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[40vh]">
                <div className="animate-pulse rounded-2xl bg-gray-200 w-full max-w-4xl h-64 md:h-96 mb-8" />
                <p className="text-gray-500 text-sm">{/* t('loading') */}Yuklanmoqda…</p>
            </div>
        );
    }

    if (loadError || !selectedProduct) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <p className="text-gray-600 mb-4">{/* */}Mahsulot topilmadi.</p>
                <button type="button" onClick={() => setCurrentPage('shop')} className="text-primary font-semibold underline">
                    Do‘konga qaytish
                </button>
            </div>
        );
    }

    // Calculate price with discount
    const finalPrice = selectedProduct.priceRanges?.find(r => quantity >= r.min && quantity <= r.max);
    const discount = finalPrice ? finalPrice.discount : 0;
    const priceWithDiscount = selectedProduct.price * (1 - discount / 100);
    const favorite = isFavorite(selectedProduct.id);

    const productName = selectedProduct?.[`name_${language}`] || selectedProduct?.name || t('shop');
    const categoryDisplayName = selectedProduct?.categories?.[`name_${language}`] || selectedProduct?.categories?.name || selectedProduct?.category;
    const categoryRawName = selectedProduct?.categories?.name;

    const breadcrumbItems = [
        { label: t('home'), onClick: () => setCurrentPage('home') },
        { label: t('shop'), onClick: () => setCurrentPage('shop') },
        ...(categoryDisplayName && categoryRawName
            ? [{ label: categoryDisplayName, onClick: () => { setSelectedCategory({ category: categoryRawName }); setCurrentPage('shop'); } }]
            : []),
        { label: productName }
    ];

    return (
        <>
            <PageMeta title={productName} description={t('metaDescProduct')} siteName={settings?.site_name} />
            <div className="container mx-auto px-4 md:px-6 py-8 relative">
            <Breadcrumb items={breadcrumbItems} />
            {/* Notification */}
            {notification.show && (
                <div className={`fixed top-24 right-4 z-50 animate-fade-in-up flex items-center p-4 rounded-xl shadow-2xl border ${notification.type === 'success'
                    ? 'bg-white border-green-100 text-green-800'
                    : 'bg-white border-red-100 text-red-800'
                    }`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${notification.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                        {notification.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <X className="w-6 h-6" />}
                    </div>
                    <div>
                        <p className="font-bold text-sm">{notification.type === 'success' ? t('orderSuccess') || 'Muvaffaqiyatli!' : t('error') || 'Xatolik'}</p>
                        <p className="text-xs opacity-80">{notification.message}</p>
                    </div>
                    <button
                        onClick={() => setNotification({ ...notification, show: false })}
                        className="ml-6 p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}
            {/* Back Button */}
            <button
                onClick={() => setCurrentPage('shop')}
                className="flex items-center text-gray-500 hover:text-primary mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('backToShop') || 'Back to Shop'}
            </button>

            <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-gray-100">
                <div className="grid lg:grid-cols-2 gap-12 mb-16">
                    {/* Gallery or 3D Viewer */}
                    <div className="relative group">
                        {viewMode === '3d' && selectedProduct.model_3d_url ? (
                            <div className="w-full h-[400px] md:h-[600px] rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden relative">
                                <model-viewer
                                    ref={modelViewerRef}
                                    src={selectedProduct.model_3d_url}
                                    alt={selectedProduct[`name_${language}`] || selectedProduct.name || ''}
                                    auto-rotate
                                    camera-controls
                                    ar
                                    ar-modes="webxr scene-viewer quick-look"
                                    ar-scale="auto"
                                    touch-action="pan-y"
                                    style={{ width: '100%', height: '100%' }}
                                    shadow-intensity="1"
                                    environment-image="neutral"
                                    exposure="1"
                                ></model-viewer>
                                <button
                                    onClick={() => setViewMode('image')}
                                    className="absolute top-4 right-4 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-lg hover:bg-white transition-all text-gray-600"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        ) : viewMode === '360' && selectedProduct.images?.length >= 5 ? (
                            <div className="w-full h-[400px] md:h-[600px] rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden relative">
                                <ThreeSixtyViewer
                                    images={selectedProduct.images}
                                    productName={selectedProduct[`name_${language}`] || selectedProduct.name || ''}
                                />
                                <button
                                    onClick={() => setViewMode('image')}
                                    className="absolute top-4 right-4 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-lg hover:bg-white transition-all text-gray-600 z-10"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <ProductGallery
                                    images={selectedProduct.images}
                                    productName={selectedProduct[`name_${language}`] || selectedProduct.name || ''}
                                />
                                <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                                    {selectedProduct.model_3d_url && (
                                        <button
                                            onClick={() => setViewMode('3d')}
                                            className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-xl shadow-xl hover:bg-white transition-all text-primary font-bold flex items-center gap-2 border border-primary/20 hover:scale-105 active:scale-95"
                                        >
                                            <Box className="w-5 h-5" />
                                            3D KO'RISH
                                        </button>
                                    )}
                                    {selectedProduct.images?.length >= 5 && (
                                        <button
                                            onClick={() => setViewMode('360')}
                                            className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-xl shadow-xl hover:bg-white transition-all text-secondary font-bold flex items-center gap-2 border border-secondary/20 hover:scale-105 active:scale-95"
                                        >
                                            <RotateCw className="w-5 h-5 animate-spin-slow" />
                                            360° AYLANISH
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Product Info */}
                    <div>
                        {/* Breadcrumb */}
                        <div className="flex items-center text-sm text-gray-500 mb-4 font-medium uppercase tracking-wider">
                            <span>{selectedProduct.categories?.[`name_${language}`] || selectedProduct.categories?.name || ''}</span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 text-gray-900 leading-tight">
                            {selectedProduct[`name_${language}`] || selectedProduct.name || ''}
                        </h1>

                        <div className="flex items-center gap-6 mb-6">
                            {/* Rating */}
                            <div className="flex items-center">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < Math.floor(averageRating)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="ml-2 text-sm text-gray-500 font-medium">
                                    {averageRating} ({reviewsCount} {t('reviews')})
                                </span>
                            </div>

                            {/* Share Button */}
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors text-sm font-medium"
                                title={t('share') || 'Ulashish'}
                            >
                                <Share2 className="w-4 h-4" />
                                {t('share') || 'Ulashish'}
                            </button>

                            {/* Code Display */}
                            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-secondary">
                                {selectedProduct.size && (
                                    <div className="flex items-center gap-1">
                                        <span className="opacity-60">{t('sku') || 'Kod'}:</span>
                                        <span>{selectedProduct.size}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Color Selection */}
                        {(selectedProduct.colors?.length > 0 || selectedProduct.color) && (
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                                    {t('color') || 'Rang'}: <span className="text-secondary ml-1">{translateColor(selectedColor || selectedProduct.color)}</span>
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {selectedProduct.colors?.length > 0 ? (
                                        selectedProduct.colors.map((color, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedColor(color)}
                                                className={`px-4 py-2 rounded-xl border-2 transition-all font-bold text-xs ${selectedColor === color
                                                    ? 'border-primary bg-primary/5 text-primary shadow-sm'
                                                    : 'border-gray-100 bg-white text-gray-500 hover:border-primary/50'
                                                    }`}
                                            >
                                                {translateColor(color)}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-4 py-2 rounded-xl border-2 border-primary bg-primary/5 text-primary font-bold text-xs">
                                            {translateColor(selectedProduct.color)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Price */}
                        <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-end gap-3 mb-2">
                                <div className="text-4xl font-bold text-gray-900">
                                    {formatPriceUSDWithUnit(priceWithDiscount, Boolean(selectedProduct.is_kg))}
                                </div>
                                {discount > 0 && (
                                    <div className="text-xl text-gray-400 line-through mb-1">
                                        {formatPriceUSDWithUnit(selectedProduct.price, Boolean(selectedProduct.is_kg))}
                                    </div>
                                )}
                            </div>
                            {discount > 0 && (
                                <p className="text-red-500 font-medium text-sm">
                                    Save {discount}% {t('onBulkOrder') || ''}
                                </p>
                            )}
                        </div>


                        {/* Bulk Order Toggle */}
                        {selectedProduct.colors?.length > 1 && (
                            <button
                                onClick={() => setShowBulkOrder(!showBulkOrder)}
                                className="mb-8 flex items-center gap-2 text-primary font-bold hover:underline"
                            >
                                {showBulkOrder ? t('backToSingle') : `+ ${t('bulkOrder')}`}
                            </button>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col gap-4 mb-8">
                            {showBulkOrder && selectedProduct.colors?.length > 1 ? (
                                <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-inner">
                                    <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">{t('colorQuantity')}</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {selectedProduct.colors.map((color, idx) => (
                                            <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 italic">
                                                <span className="font-bold text-sm">{translateColor(color)}</span>
                                                <div className="flex items-center border border-gray-200 rounded-lg h-10 overflow-hidden shadow-sm">
                                                    <button
                                                        onClick={() =>
                                                            setBulkQuantities((prev) => {
                                                                const cur =
                                                                    prev[color] === '' || prev[color] === undefined
                                                                        ? 0
                                                                        : Number(prev[color]) || 0;
                                                                return { ...prev, [color]: Math.max(0, cur - 1) };
                                                            })
                                                        }
                                                        className="w-10 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 transition border-r border-gray-100"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        autoComplete="off"
                                                        aria-label={translateColor(color)}
                                                        value={
                                                            bulkQuantities[color] === ''
                                                                ? ''
                                                                : String(bulkQuantities[color] ?? 0)
                                                        }
                                                        onChange={(e) => {
                                                            const v = e.target.value;
                                                            if (v === '') {
                                                                setBulkQuantities((prev) => ({ ...prev, [color]: '' }));
                                                                return;
                                                            }
                                                            const digits = v.replace(/\D/g, '');
                                                            if (digits === '') {
                                                                setBulkQuantities((prev) => ({ ...prev, [color]: '' }));
                                                                return;
                                                            }
                                                            const n = parseInt(digits, 10);
                                                            if (Number.isNaN(n)) return;
                                                            setBulkQuantities((prev) => ({ ...prev, [color]: n }));
                                                        }}
                                                        onFocus={(e) => {
                                                            const q = bulkQuantities[color];
                                                            if (q === '' || q === undefined || q === 0) {
                                                                e.target.select();
                                                            }
                                                        }}
                                                        onBlur={() => {
                                                            setBulkQuantities((prev) => {
                                                                const x = prev[color];
                                                                if (x === '' || x === undefined) {
                                                                    return { ...prev, [color]: 0 };
                                                                }
                                                                return prev;
                                                            });
                                                        }}
                                                        className="min-w-[2.25rem] w-12 text-center font-bold text-sm outline-none bg-transparent"
                                                    />
                                                    <button
                                                        onClick={() =>
                                                            setBulkQuantities((prev) => {
                                                                const cur =
                                                                    prev[color] === '' || prev[color] === undefined
                                                                        ? 0
                                                                        : Number(prev[color]) || 0;
                                                                return { ...prev, [color]: cur + 1 };
                                                            })
                                                        }
                                                        className="w-10 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 transition border-l border-gray-100"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => {
                                            let addedCount = 0;
                                            Object.entries(bulkQuantities).forEach(([color, qty]) => {
                                                if (qty > 0) {
                                                    addToCart(selectedProduct, parseInt(qty), color);
                                                    addedCount++;
                                                }
                                            });
                                            if (addedCount > 0) {
                                                showNotification(`${addedCount} ${t('itemsAddedToCart')}`);
                                            } else {
                                                showNotification(t('selectAtLeastOneColor'), "error");
                                            }
                                        }}
                                        className="w-full bg-secondary hover:bg-secondary-dark text-white h-14 rounded-xl font-bold transition-all shadow-lg hover:shadow-secondary/30 mt-4 flex items-center justify-center gap-2"
                                    >
                                        <ShoppingCart className="w-5 h-5" />
                                        {t('addSelectedToCart')}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    <div className="flex gap-4">
                                        <div className="flex items-center border border-gray-200 rounded-lg bg-white h-12 overflow-hidden shadow-sm">
                                            <button
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="w-12 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 transition border-r border-gray-100"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <input
                                                type="number"
                                                min="1"
                                                value={quantity}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value);
                                                    if (!isNaN(val)) {
                                                        setQuantity(val);
                                                    } else if (e.target.value === '') {
                                                        setQuantity('');
                                                    }
                                                }}
                                                onBlur={() => {
                                                    if (quantity === '' || quantity < 1) {
                                                        setQuantity(1);
                                                    }
                                                }}
                                                className="w-16 text-center font-bold text-lg outline-none bg-transparent"
                                            />
                                            <button
                                                onClick={() => setQuantity(quantity === '' ? 1 : parseInt(quantity) + 1)}
                                                className="w-12 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 transition border-l border-gray-100"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => {
                                                addToCart(selectedProduct, quantity === '' ? 1 : parseInt(quantity), selectedColor);
                                                showNotification(t('itemAdded') || 'Mahsulot savatga qo\'shildi!');
                                            }}
                                            className="flex-1 bg-primary hover:bg-primary-dark text-white h-12 rounded-lg font-bold transition-all shadow-lg hover:shadow-primary/30 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
                                        >
                                            <ShoppingCart className="w-5 h-5" />
                                            {t('addToCart')}
                                        </button>
                                        <button
                                            onClick={() => toggleFavorite(selectedProduct.id)}
                                            className={`w-12 h-12 flex items-center justify-center border rounded-lg transition-colors ${favorite ? 'border-red-200 bg-red-50 text-red-500' : 'border-gray-200 hover:border-primary hover:text-primary'}`}
                                        >
                                            <Heart className={`w-5 h-5 ${favorite ? 'fill-current' : ''}`} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Features List */}
                        <div className="space-y-4 border-t border-gray-100 pt-6">
                            <div className="flex items-center gap-3 text-gray-700">
                                <ShieldCheck className="w-5 h-5 text-secondary shrink-0" />
                                <span>{t('warrantyDesc')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-t border-gray-100 pt-10">
                    <div className="flex space-x-8 mb-8 border-b border-gray-100">
                        {['description', 'features', 'reviews'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 px-2 font-bold text-lg transition-all relative ${activeTab === tab
                                    ? 'text-primary'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {t(tab)}
                                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transition-transform duration-300 ${activeTab === tab ? 'scale-x-100' : 'scale-x-0'}`}></span>
                            </button>
                        ))}
                    </div>

                    <div className="min-h-[200px]">
                        {activeTab === 'description' && (
                            <div className="prose max-w-none text-gray-600 leading-relaxed">
                                <p>{selectedProduct[`description_${language}`] || selectedProduct.description || ''}</p>
                            </div>
                        )}

                        {activeTab === 'features' && (
                            <div className="grid md:grid-cols-2 gap-4">
                                {selectedProduct.features && (() => {
                                    const f = selectedProduct.features;
                                    const byLang = f[language];
                                    const hasLangBuckets = f && typeof f === 'object' && ['uz', 'ru', 'en'].some((code) => Array.isArray(f[code]));

                                    if (Array.isArray(byLang)) {
                                        return byLang
                                            .filter((feature) => {
                                                if (typeof feature === 'string') return feature.trim() !== '';
                                                return String(feature?.name ?? '').trim() || String(feature?.value ?? '').trim();
                                            })
                                            .map((feature, idx) => {
                                                const line = typeof feature === 'string'
                                                    ? feature
                                                    : (() => {
                                                        const n = String(feature?.name ?? '').trim();
                                                        const v = String(feature?.value ?? '').trim();
                                                        if (n && v) return `${n}: ${v}`;
                                                        return n || v || '';
                                                    })();
                                                return (
                                                    <div key={idx} className="flex items-center p-4 bg-gray-50 rounded-lg">
                                                        <div className="w-2 h-2 bg-secondary rounded-full mr-3 shrink-0"></div>
                                                        <span className="text-gray-700 font-medium">{line}</span>
                                                    </div>
                                                );
                                            });
                                    }

                                    if (hasLangBuckets && !Array.isArray(byLang)) {
                                        return (
                                            <div className="col-span-full text-gray-500 italic md:col-span-2">
                                                {t('noFeatures') || 'No features available'}
                                            </div>
                                        );
                                    }

                                    return Object.entries(f).map(([key, value], idx) => (
                                        <div key={idx} className="flex items-center p-4 bg-gray-50 rounded-lg">
                                            <div className="w-2 h-2 bg-secondary rounded-full mr-3"></div>
                                            <span className="text-gray-700 font-medium">
                                                <span className="font-bold text-gray-900">{key}: </span>
                                                {value}
                                            </span>
                                        </div>
                                    ));
                                })()}
                                {!selectedProduct.features && (
                                    <div className="text-gray-500 italic">
                                        {t('noFeatures') || 'No features available'}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="space-y-8">
                                {/* Reviews List */}
                                <div className="space-y-4">
                                    {reviews.length > 0 ? (
                                        reviews.map((review) => (
                                            <div key={review.id} className="bg-gray-50 p-6 rounded-xl">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="font-bold text-gray-900">
                                                        {review.auth_users?.email?.split('@')[0] || 'Foydalanuvchi'}
                                                    </div>
                                                    <span className="text-sm text-gray-500">
                                                        {new Date(review.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex text-yellow-400 mb-3">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                                                    ))}
                                                </div>
                                                <p className="text-gray-700">{review.comment}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 bg-gray-50 rounded-xl">
                                            <p className="text-gray-500 font-medium">{t('noReviews')}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Review Form */}
                                <div className="border-t border-gray-100 pt-8">
                                    <h3 className="text-xl font-bold mb-6">{t('leaveReview')}</h3>
                                    <form onSubmit={handleSubmitReview} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('yourRating')}</label>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                        className={`text-2xl transition-colors ${reviewForm.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                                    >
                                                        ★
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('yourReview')}</label>
                                            <textarea
                                                rows="4"
                                                value={reviewForm.comment}
                                                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder={t('reviewPlaceholder')}
                                                required
                                            ></textarea>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={submitStatus === 'submitting'}
                                            className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary-dark transition shadow-lg hover:shadow-primary/30 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {submitStatus === 'submitting' ? t('submitting') : t('submit')}
                                        </button>

                                        {submitStatus === 'success' && (
                                            <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 mt-4">
                                                {t('reviewSubmitted') || 'Sharhingiz qabul qilindi! Moderator tasdiqlagandan so\'ng chiqadi.'}
                                            </div>
                                        )}
                                        {submitStatus === 'error' && (
                                            <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 mt-4">
                                                {t('errorMsg') || 'Xatolik yuz berdi. Iltimos qaytadan urinib ko\'ring.'}
                                            </div>
                                        )}
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default ProductPage;