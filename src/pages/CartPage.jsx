import React from 'react';
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';

const CartPage = () => {
    const { cart, removeFromCart, updateQuantity, calculatePrice, getTotalPrice, setCurrentPage } = useApp();
    const { language, t } = useLanguage();

    if (cart.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <ShoppingCart className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-3xl font-display font-bold mb-3 text-gray-900">{t('emptyCart')}</h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">{t('emptyCartMessage') || "Your cart is currently empty. browse our collection to find the perfect curtains accessories."}</p>
                <button
                    onClick={() => setCurrentPage('shop')}
                    className="bg-primary text-white px-8 py-4 rounded-lg hover:bg-primary-dark transition-all shadow-lg hover:shadow-primary/30 font-bold flex items-center"
                >
                    {t('continueShopping') || 'Start Shopping'}
                    <ArrowRight className="ml-2 w-5 h-5" />
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 md:px-6 py-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-8 text-gray-900">{t('cart') || 'Your Cart'}</h1>

            <div className="grid lg:grid-cols-3 gap-12">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-6">
                    {cart.map(item => {
                        const itemPrice = calculatePrice(item, item.quantity);
                        const discount = Math.round((1 - itemPrice / item.price) * 100);

                        return (
                            <div key={item.id} className="group bg-white rounded-xl p-4 md:p-6 flex gap-6 border border-gray-100 hover:border-gray-200 transition-colors shadow-sm">
                                <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                                    <img
                                        src={item.images?.[0] || ''}
                                        alt={item.name?.[language] || ''}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>

                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                                                {item.name?.[language] || ''}
                                            </h3>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-gray-400 hover:text-red-500 p-1"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-2">{item.category?.[language]}</p>
                                    </div>

                                    <div className="flex flex-wrap items-end justify-between gap-4">
                                        <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="p-2 hover:bg-white text-gray-600 rounded-l-lg transition-colors"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-10 text-center font-bold text-gray-900">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="p-2 hover:bg-white text-gray-600 rounded-r-lg transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="text-right">
                                            <div className="flex items-center gap-2 justify-end">
                                                <span className="text-xl font-bold text-primary">
                                                    ${itemPrice.toLocaleString()}
                                                </span>
                                            </div>
                                            {discount > 0 && (
                                                <div className="text-sm text-green-600 font-medium">
                                                    Saved {discount}%
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    <button
                        onClick={() => setCurrentPage('shop')}
                        className="flex items-center text-gray-500 hover:text-primary font-medium mt-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t('continueShopping') || 'Continue Shopping'}
                    </button>
                </div>

                {/* Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 sticky top-24 border border-gray-100">
                        <h3 className="font-display font-bold text-xl mb-6 text-gray-900 border-b border-gray-100 pb-4">{t('orderSummary') || 'Order Summary'}</h3>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>{t('subtotal') || 'Subtotal'}</span>
                                <span>{t('subtotal') || 'Subtotal'}</span>
                                <span className="font-medium">${getTotalPrice().toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>{t('shipping') || 'Shipping'}</span>
                                <span className="text-green-600 font-medium">{t('free') || 'Free'}</span>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6 mb-8">
                            <div className="flex justify-between items-end">
                                <span className="text-lg font-bold text-gray-900">{t('total')}:</span>
                                <span className="text-3xl font-display font-bold text-primary">
                                    ${getTotalPrice().toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => setCurrentPage('checkout')}
                            className="w-full bg-primary text-white py-4 rounded-lg hover:bg-primary-dark transition-all shadow-lg hover:shadow-primary/30 font-bold text-lg flex justify-center items-center group"
                        >
                            {t('checkout')}
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <div className="mt-6 flex items-center justify-center gap-4 text-gray-400 grayscale opacity-70">
                            {/* Small payment icons or trust badges */}
                            <div className="h-6 w-10 bg-gray-200 rounded"></div>
                            <div className="h-6 w-10 bg-gray-200 rounded"></div>
                            <div className="h-6 w-10 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;