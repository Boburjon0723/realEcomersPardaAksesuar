import React, { useState, useEffect } from 'react';
import { Heart, Star, ShoppingBag, Eye } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';

const ProductCard = ({ product }) => {
    const { addToCart, setCurrentPage, setSelectedProduct, toggleFavorite, isFavorite } = useApp();
    const { language, t } = useLanguage();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    // Rasmlarni avtomatik almashtirish
    useEffect(() => {
        let interval;
        if (isHovered && product.images.length > 1) {
            interval = setInterval(() => {
                setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
            }, 1500);
        } else {
            setCurrentImageIndex(0);
        }
        return () => clearInterval(interval);
    }, [product.images.length, isHovered]);

    const favorite = isFavorite(product.id);
    const discountPercent = product.oldPrice
        ? Math.round((1 - product.price / product.oldPrice) * 100)
        : 0;

    const handleProductClick = () => {
        setSelectedProduct(product);
        setCurrentPage('product');
    };

    return (
        <div
            className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image Container */}
            <div className="relative aspect-[4/5] overflow-hidden cursor-pointer bg-gray-50" onClick={handleProductClick}>
                <img
                    src={product.images[currentImageIndex]}
                    alt={product[`name_${language}`] || product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Overlays */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {discountPercent > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-sm">
                            -{discountPercent}%
                        </span>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(product.id);
                        }}
                        className={`p-2 rounded-full shadow-md hover:scale-110 transition-transform ${favorite ? 'bg-red-50 text-red-500' : 'bg-white text-gray-600 hover:text-primary'}`}
                    >
                        <Heart className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleProductClick();
                        }}
                        className="p-2 bg-white text-gray-600 hover:text-primary rounded-full shadow-md hover:scale-110 transition-transform"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                </div>

                {/* Add to Cart (Quick) */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                    }}
                    className="absolute bottom-4 left-4 right-4 bg-white text-gray-900 font-medium py-2 rounded shadow-lg translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary hover:text-white flex items-center justify-center gap-2"
                >
                    <ShoppingBag className="w-4 h-4" />
                    {t('addToCart')}
                </button>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex justify-between items-start mb-1 text-xs font-bold uppercase tracking-wider">
                    <div className="text-gray-400">
                        {product.categories?.[`name_${language}`] || product.categories?.name || 'Category'}
                    </div>
                    {product.size && (
                        <div className="text-primary/70 bg-primary/5 px-2 py-0.5 rounded text-[10px]">
                            {t('sku')}: {product.size}
                        </div>
                    )}
                </div>
                <h3
                    className="font-display font-bold text-xl text-gray-900 mb-2 truncate cursor-pointer hover:text-primary transition-colors leading-tight"
                    onClick={handleProductClick}
                >
                    {product[`name_${language}`] || product.name}
                </h3>

                <div className="flex items-end justify-between">
                    <div>
                        <div className="flex items-center gap-1">
                            <span className="font-bold text-lg text-gray-900">
                                ${product.price?.toLocaleString()}
                            </span>
                            {product.oldPrice && (
                                <span className="text-sm text-gray-400 line-through">
                                    ${product.oldPrice?.toLocaleString()}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-yellow-500">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="font-medium text-gray-600">{product.rating}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
