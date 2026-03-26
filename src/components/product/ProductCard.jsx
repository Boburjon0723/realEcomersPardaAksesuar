import React, { useState, useEffect, useMemo } from 'react';
import { Heart, Star, ShoppingBag, Eye, Box } from 'lucide-react';
import { useApp } from '../../hooks/useApp';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatPriceUSD } from '../../utils/price';

const ProductCard = ({ product, onQuickView }) => {
    const { addToCart, setCurrentPage, toggleFavorite, isFavorite } = useApp();
    const { language, t, translateColor, swatchColor } = useLanguage();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const images = product.images && product.images.length > 0 ? product.images : (product.image_url ? [product.image_url] : []);
    const hasMultipleImages = images.length > 1;

    // 2+ rasm bo'lsa: almashish intervali (hover da tezroq)
    useEffect(() => {
        if (!hasMultipleImages) return;
        const intervalMs = isHovered ? 1500 : 2500;
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, intervalMs);
        return () => clearInterval(interval);
    }, [images.length, isHovered, hasMultipleImages]);

    const favorite = isFavorite(product.id);
    const discountPercent = product.oldPrice
        ? Math.round((1 - product.price / product.oldPrice) * 100)
        : 0;
    const categoryName = product.categories?.[`name_${language}`] || product.categories?.name || product.category || '';
    const productName = product[`name_${language}`] || product.name;
    const displayPrice = formatPriceUSD(product.price);

    /** Bir kartada ko‘rinadigan rang variantlari (swatch) — takrorlarsiz */
    const variantColors = useMemo(() => {
        const raw =
            Array.isArray(product.colors) && product.colors.length > 0
                ? product.colors
                : product.color
                  ? [product.color]
                  : [];
        return [...new Set(raw.map((c) => (c == null ? '' : String(c).trim())).filter(Boolean))];
    }, [product.colors, product.color]);

    const handleProductClick = () => {
        setCurrentPage('product', { product });
    };

    return (
        <div
            className="group flex flex-col bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_50px_rgba(5,77,59,0.15)] transition-all duration-400 overflow-hidden border border-gray-200 hover:border-primary/30 hover:-translate-y-1"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image Container */}
            <div className="relative flex-shrink-0 aspect-[4/5] overflow-hidden cursor-pointer bg-gray-50" onClick={handleProductClick}>
                {/* Content: Image or 3D Model */}
                {product.model_3d_url && (isHovered || images.length === 0) ? (
                    <div className="w-full h-full relative">
                        <model-viewer
                            src={product.model_3d_url}
                            alt={productName}
                            auto-rotate
                            rotation-per-second="60deg"
                            interaction-prompt="none"
                            camera-controls
                            style={{ width: '100%', height: '100%', backgroundColor: '#f9fafb' }}
                            shadow-intensity="1"
                            environment-image="neutral"
                            exposure="1"
                        ></model-viewer>
                        {isHovered && (
                            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] px-2.5 py-1 rounded-full backdrop-blur-md font-semibold">
                                3D
                            </div>
                        )}
                    </div>
                ) : hasMultipleImages ? (
                    <div className="relative w-full h-full overflow-hidden">
                        {images.map((imgSrc, idx) => (
                            <img
                                key={idx}
                                src={imgSrc || 'https://via.placeholder.com/400x500?text=No+Image'}
                                alt={`${productName} ${idx + 1}`}
                                loading={idx === 0 ? 'lazy' : 'eager'}
                                className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:scale-105 ${
                                    idx === currentImageIndex ? 'opacity-100 z-[1]' : 'opacity-0 z-0 pointer-events-none'
                                }`}
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500?text=No+Image'; }}
                            />
                        ))}
                    </div>
                ) : (
                    <img
                        src={images[0] || 'https://via.placeholder.com/400x500?text=No+Image'}
                        alt={productName}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500?text=No+Image'; }}
                    />
                )}

                {/* Badges row - chap ustun */}
                <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 pointer-events-none [&_button]:pointer-events-auto">
                    {discountPercent > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg">
                            -{discountPercent}%
                        </span>
                    )}
                    {product.model_3d_url && !discountPercent && (
                        <div className="bg-primary text-white p-2 rounded-lg shadow-lg flex items-center gap-1 w-fit">
                            <Box size={12} className="flex-shrink-0" />
                            <span className="text-[10px] font-bold">3D</span>
                        </div>
                    )}
                    {product.model_3d_url && discountPercent > 0 && (
                        <div className="bg-primary/95 text-white p-1.5 rounded-lg shadow-lg flex items-center gap-1 w-fit">
                            <Box size={10} />
                            <span className="text-[9px] font-bold">3D</span>
                        </div>
                    )}
                </div>

                {/* Quick Actions — kichik ekranda doim ko‘rinadi; md+ da hover */}
                <div className="absolute bottom-14 left-2 right-2 z-20 flex justify-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300">
                    <button
                        type="button"
                        aria-label={favorite ? t('removeFromFavorites') : t('addToFavorites')}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(product.id);
                        }}
                        className={`p-2 rounded-lg shadow-lg hover:scale-105 transition-all ${favorite ? 'bg-red-500 text-white' : 'bg-white/95 backdrop-blur-sm text-gray-600 hover:text-primary'}`}
                    >
                        <Heart className={`w-3.5 h-3.5 ${favorite ? 'fill-current' : ''}`} />
                    </button>
                    <button
                        type="button"
                        aria-label={t('quickViewBtn')}
                        onClick={(e) => {
                            e.stopPropagation();
                            onQuickView ? onQuickView() : handleProductClick();
                        }}
                        className="p-2 bg-white/95 backdrop-blur-sm text-gray-600 hover:text-primary rounded-lg shadow-lg hover:scale-105 transition-all"
                    >
                        <Eye className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Rasmlar karuseli indikatori (rang emas — faqat bir nechta rasm bo‘lsa) */}
                {hasMultipleImages && (
                    <div
                        className="absolute bottom-16 left-0 right-0 flex justify-center gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none"
                        aria-hidden
                        title={t('productCardImageDotsHint')}
                    >
                        {images.map((_, i) => (
                            <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentImageIndex ? 'bg-white scale-125' : 'bg-white/60'}`}
                            />
                        ))}
                    </div>
                )}

                {/* Savat — mobil planshetda doim; md+ da hover bilan chiqadi */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-2 translate-y-0 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/50 to-transparent">
                    <button
                        type="button"
                        aria-label={`${t('addToCart')}: ${productName}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                        }}
                        className="w-full bg-primary text-white font-medium py-2 px-3 rounded-lg text-sm hover:bg-primary/90 flex items-center justify-center gap-1.5 transition-colors"
                    >
                        <ShoppingBag className="w-3.5 h-3.5 flex-shrink-0" />
                        {t('addToCart')}
                    </button>
                </div>
            </div>

            {/* Content - flex-1: Grid stretch bo'lganda kulrang fon qolgan joyni to'ldiradi */}
            <div className="flex-1 min-h-0 flex flex-col p-4 sm:p-5 bg-stone-200 border-t border-stone-300">
                {categoryName && (
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-primary/80 mb-1.5">
                        {categoryName}
                    </p>
                )}
                <h3
                    className="font-display font-bold text-base sm:text-lg text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-primary transition-colors leading-snug min-h-[2.5rem]"
                    onClick={handleProductClick}
                >
                    {productName}
                </h3>

                {/* Rang variantlari — dumaloq swatch (product_colors.hex_code bo‘yicha) */}
                {variantColors.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        <div className="flex items-center gap-1" role="list" aria-label={t('color') || 'Colors'}>
                            {variantColors.slice(0, 7).map((c) => (
                                <span
                                    key={c}
                                    role="listitem"
                                    className="w-4 h-4 shrink-0 rounded-full border border-gray-300/90 shadow-inner ring-1 ring-black/5"
                                    style={{ backgroundColor: swatchColor(c) }}
                                    title={translateColor(c)}
                                />
                            ))}
                        </div>
                        {variantColors.length > 7 ? (
                            <span className="text-[11px] font-semibold text-gray-500">+{variantColors.length - 7}</span>
                        ) : variantColors.length === 1 ? (
                            <span className="text-xs text-gray-500 truncate">{translateColor(variantColors[0])}</span>
                        ) : null}
                    </div>
                )}

                <div className="mt-auto flex items-end justify-between gap-2 pt-2">
                    <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-lg text-gray-900">
                            {displayPrice}
                        </span>
                        {product.oldPrice && (
                            <span className="text-sm text-gray-400 line-through">
                                {formatPriceUSD(product.oldPrice)}
                            </span>
                        )}
                    </div>
                    {(product.rating > 0 || product.reviews > 0) && (
                        <div className="flex items-center gap-1 text-amber-500 shrink-0">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm font-semibold text-gray-700">{product.rating || 0}</span>
                            {product.reviews > 0 && (
                                <span className="text-xs text-gray-400">({product.reviews})</span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
