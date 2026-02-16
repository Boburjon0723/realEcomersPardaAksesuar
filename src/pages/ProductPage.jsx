import React, { useState } from 'react';
import { Star, Minus, Plus, Heart, ShieldCheck, Truck, ArrowLeft, CheckCircle, X, ShoppingCart } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import ProductGallery from '../components/product/ProductGallery';
import { supabase } from '../supabaseClient';

const ProductPage = () => {
    const { selectedProduct, currentUser, addToCart, setCurrentPage, toggleFavorite, isFavorite } = useApp();
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

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 5000);
    };

    const fetchReviews = React.useCallback(async () => {
        const { data } = await supabase
            .from('reviews')
            .select('*, auth_users(email)')
            .eq('product_id', selectedProduct.id)
            .eq('status', 'approved')
            .order('created_at', { ascending: false });
        setReviews(data || []);
    }, [selectedProduct?.id]);

    React.useEffect(() => {
        if (selectedProduct?.id) {
            fetchReviews();
            // Reset selected color and bulk quantities when product changes
            setSelectedColor(selectedProduct.colors?.[0] || selectedProduct.color || null);

            const initialBulk = {};
            if (selectedProduct.colors?.length > 0) {
                selectedProduct.colors.forEach(c => initialBulk[c] = 0);
            }
            setBulkQuantities(initialBulk);
            setShowBulkOrder(false);
        }
    }, [selectedProduct?.id, selectedProduct?.color, selectedProduct?.colors, fetchReviews]);

    // Dynamic Rating Calculation
    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
        : selectedProduct.rating || 0;

    const reviewsCount = reviews.length > 0 ? reviews.length : selectedProduct.reviews || 0;

    const handleSubmitReview = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            showNotification(t('loginToReview'), 'error');
            return;
        }

        setSubmitStatus('submitting');
        const { error } = await supabase.from('reviews').insert([
            {
                product_id: selectedProduct.id,
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

    if (!selectedProduct) return null;

    // Calculate price with discount
    const finalPrice = selectedProduct.priceRanges?.find(r => quantity >= r.min && quantity <= r.max);
    const discount = finalPrice ? finalPrice.discount : 0;
    const priceWithDiscount = selectedProduct.price * (1 - discount / 100);
    const favorite = isFavorite(selectedProduct.id);

    return (
        <div className="container mx-auto px-4 md:px-6 py-8 relative">
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
                    {/* Gallery */}
                    <ProductGallery
                        images={selectedProduct.images}
                        productName={selectedProduct[`name_${language}`] || selectedProduct.name || ''}
                    />

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
                                    ${priceWithDiscount.toLocaleString()}
                                </div>
                                {discount > 0 && (
                                    <div className="text-xl text-gray-400 line-through mb-1">
                                        ${selectedProduct.price.toLocaleString()}
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
                                                        onClick={() => setBulkQuantities(prev => ({ ...prev, [color]: Math.max(0, (prev[color] || 0) - 1) }))}
                                                        className="w-10 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 transition border-r border-gray-100"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={bulkQuantities[color] || 0}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value);
                                                            if (!isNaN(val)) setBulkQuantities(prev => ({ ...prev, [color]: val }));
                                                            else if (e.target.value === '') setBulkQuantities(prev => ({ ...prev, [color]: '' }));
                                                        }}
                                                        className="w-10 text-center font-bold text-sm outline-none bg-transparent"
                                                    />
                                                    <button
                                                        onClick={() => setBulkQuantities(prev => ({ ...prev, [color]: (parseInt(prev[color]) || 0) + 1 }))}
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
                                <Truck className="w-5 h-5 text-secondary" />
                                <span>Free shipping on orders over $100</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700">
                                <ShieldCheck className="w-5 h-5 text-secondary" />
                                <span>2 year quality warranty</span>
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
                                {selectedProduct.features && (
                                    Array.isArray(selectedProduct.features[language])
                                        ? selectedProduct.features[language].map((feature, idx) => (
                                            <div key={idx} className="flex items-center p-4 bg-gray-50 rounded-lg">
                                                <div className="w-2 h-2 bg-secondary rounded-full mr-3"></div>
                                                <span className="text-gray-700 font-medium">{feature}</span>
                                            </div>
                                        ))
                                        : Object.entries(selectedProduct.features).map(([key, value], idx) => (
                                            <div key={idx} className="flex items-center p-4 bg-gray-50 rounded-lg">
                                                <div className="w-2 h-2 bg-secondary rounded-full mr-3"></div>
                                                <span className="text-gray-700 font-medium">
                                                    <span className="font-bold text-gray-900">{key}: </span>
                                                    {value}
                                                </span>
                                            </div>
                                        ))
                                )}
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
    );
};

export default ProductPage;