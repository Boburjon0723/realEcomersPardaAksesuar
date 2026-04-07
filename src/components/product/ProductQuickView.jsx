import React, { useState } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { useApp } from '../../hooks/useApp';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatPriceUSDWithUnit } from '../../utils/price';

const ProductQuickView = ({ product, onClose }) => {
    const { addToCart, setCurrentPage } = useApp();
    const { language, t, translateColor } = useLanguage();
    const [selectedColor, setSelectedColor] = useState(product?.color || product?.colors?.[0] || null);

    if (!product) return null;

    const images = product.images && product.images.length > 0 ? product.images : (product.image_url ? [product.image_url] : []);
    const productName = product[`name_${language}`] || product.name || '';
    const displayPrice = formatPriceUSDWithUnit(product.price, Boolean(product.is_kg));

    const handleAddToCart = () => {
        addToCart(product, 1, selectedColor);
        onClose();
    };

    const handleViewFull = () => {
        setCurrentPage('product', { product });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px] ui-modal-overlay" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ui-modal-panel"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="relative w-full md:w-1/2 aspect-square md:aspect-auto md:min-h-[400px] bg-gray-50">
                        <img
                            src={images[0] || 'https://via.placeholder.com/400x500?text=No+Image'}
                            alt={productName}
                            loading="lazy"
                            className="w-full h-full object-cover"
                        />
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 md:p-8 flex-1 flex flex-col">
                        <h3 className="text-xl font-display font-bold text-gray-900 mb-2">{productName}</h3>

                        {(product.colors?.length > 0 || product.color) && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('color')}</label>
                                <div className="flex flex-wrap gap-2">
                                    {(product.colors?.length > 0 ? product.colors : [product.color]).map((c, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedColor(c)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${
                                                selectedColor === c ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 hover:border-primary/50'
                                            }`}
                                        >
                                            {translateColor(c)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mb-6">
                            <span className="text-2xl font-bold text-gray-900">
                                {displayPrice}
                            </span>
                        </div>

                        <div className="mt-auto flex flex-col gap-3">
                            <button
                                onClick={handleAddToCart}
                                className="w-full bg-primary text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                {t('addToCart')}
                            </button>
                            <button
                                onClick={handleViewFull}
                                className="w-full border-2 border-primary text-primary py-3 px-4 rounded-xl font-semibold hover:bg-primary/5 transition-colors"
                            >
                                {t('viewDetails') || "To'liq ko'rish"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductQuickView;
