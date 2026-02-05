import React, { useState } from 'react';
import { Star, Minus, Plus, ChevronRight, Heart, Share2, ShieldCheck, Truck, ArrowLeft } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import ProductGallery from '../components/product/ProductGallery';
import { supabase } from '../supabaseClient';

const ProductPage = () => {
    const { selectedProduct, addToCart, setCurrentPage, toggleFavorite, isFavorite } = useApp();
    const { language, t } = useLanguage();
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [reviews, setReviews] = useState([]);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [submitStatus, setSubmitStatus] = useState('idle'); // idle, submitting, success, error

    React.useEffect(() => {
        if (selectedProduct?.id) {
            fetchReviews();
        }
    }, [selectedProduct?.id]);

    const fetchReviews = async () => {
        const { data } = await supabase
            .from('reviews')
            .select('*, auth_users(email)') // simplified join, might need checking if user_id links correctly in real DB
            // If auth_users is not available, we might just show "User".
            .eq('product_id', selectedProduct.id)
            .eq('status', 'approved')
            .order('created_at', { ascending: false });
        setReviews(data || []);
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            alert(t('loginToReview') || 'Please login to leave a review');
            return;
        }

        const { error } = await supabase.from('reviews').insert([
            {
                product_id: selectedProduct.id,
                user_id: user.id,
                rating: reviewForm.rating,
                comment: reviewForm.comment,
                status: 'pending'
            }
        ]);

        if (error) {
            console.error('Error submitting review:', error);
            setSubmitStatus('error');
            setTimeout(() => setSubmitStatus('idle'), 3000);
        } else {
            setSubmitStatus('success');
            setReviewForm({ rating: 5, comment: '' });
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
        <div className="container mx-auto px-4 md:px-6 py-8">
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
                        productName={selectedProduct.name?.[language] || ''}
                    />

                    {/* Product Info */}
                    <div>
                        {/* Breadcrumb */}
                        <div className="flex items-center text-sm text-gray-500 mb-4 font-medium uppercase tracking-wider">
                            <span>{selectedProduct.category?.[language] || ''}</span>
                            <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
                            <span>{selectedProduct.subcategory?.[language] || ''}</span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 text-gray-900 leading-tight">
                            {selectedProduct.name?.[language] || ''}
                        </h1>

                        <div className="flex items-center justify-between mb-6">
                            {/* Rating */}
                            <div className="flex items-center">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < Math.floor(selectedProduct.rating)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="ml-2 text-sm text-gray-500 font-medium">
                                    ({selectedProduct.reviews} {t('reviews')})
                                </span>
                            </div>

                            {/* Stock Status */}
                            <div className={`text-sm font-bold px-3 py-1 rounded-full ${selectedProduct.stock > 0
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                                }`}>
                                {selectedProduct.stock > 0 ? t('inStock') : t('outOfStock')}
                            </div>
                        </div>

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

                        {/* Short Description */}
                        <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                            {selectedProduct.description?.[language] || ''}
                        </p>

                        {/* Actions */}
                        <div className="flex flex-col gap-4 mb-8">
                            {/* Quantity & Cart */}
                            <div className="flex gap-4">
                                <div className="flex items-center border border-gray-200 rounded-lg bg-white h-12">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-12 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 transition"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                                        className="w-12 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 transition"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <button
                                    onClick={() => addToCart(selectedProduct, quantity)}
                                    disabled={selectedProduct.stock === 0}
                                    className="flex-1 bg-primary hover:bg-primary-dark text-white h-12 rounded-lg font-bold transition-all shadow-lg hover:shadow-primary/30 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
                                >
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
                                <p>{selectedProduct.description?.[language] || ''}</p>
                                <p className="mt-4">
                                    Enhance your interior decor with our premium quality curtain accessories.
                                    Designed solely for durability and style, this product seamlessly blends functionality with modern aesthetics.
                                </p>
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
                                    <h3 className="text-xl font-bold mb-6">Sharh qoldirish</h3>
                                    <form onSubmit={handleSubmitReview} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Bahoyingiz</label>
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
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Sharhingiz</label>
                                            <textarea
                                                rows="4"
                                                value={reviewForm.comment}
                                                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="Mahsulot haqida fikringiz..."
                                                required
                                            ></textarea>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={submitStatus === 'submitting'}
                                            className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary-dark transition shadow-lg hover:shadow-primary/30 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {submitStatus === 'submitting' ? 'Yuborilmoqda...' : 'Yuborish'}
                                        </button>

                                        {submitStatus === 'success' && (
                                            <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 mt-4">
                                                {t('reviewSubmitted') || 'Sharhingiz qabul qilindi! Moderator tasdiqlagandan so\'ng chiqadi.'}
                                            </div>
                                        )}
                                        {submitStatus === 'error' && (
                                            <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 mt-4">
                                                Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.
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