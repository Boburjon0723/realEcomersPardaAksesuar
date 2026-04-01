import React, { useState, useCallback } from 'react';
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight, ArrowLeft, X, Shield } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import PageMeta from '../components/common/PageMeta';
import { createOrder } from '../services/supabase/orders';

const CartPage = () => {
    const { cart, removeFromCart, updateQuantity, calculatePrice, getTotalPrice, setCurrentPage, settings, currentUser, clearCart } = useApp();
    const { language, t, translateColor } = useLanguage();
    const { isAdmin } = useAuth();

    const [adminModalOpen, setAdminModalOpen] = useState(false);
    const [adminSubmitting, setAdminSubmitting] = useState(false);
    const [adminError, setAdminError] = useState('');
    const [adminForm, setAdminForm] = useState({
        name: '',
        phone: '',
        address: '',
        notes: ''
    });

    const openAdminModal = useCallback(() => {
        setAdminError('');
        setAdminForm((prev) => ({
            ...prev,
            name: (currentUser?.name || '').trim(),
            phone: (currentUser?.phone || '').trim(),
        }));
        setAdminModalOpen(true);
    }, [currentUser?.name, currentUser?.phone]);

    const handleAdminQuickOrder = async (e) => {
        e.preventDefault();
        setAdminError('');
        if (!currentUser?.id) {
            setAdminError(language === 'uz' ? 'Avval tizimga kiring.' : language === 'ru' ? 'Войдите в аккаунт.' : 'Please sign in.');
            return;
        }
        const name = adminForm.name.trim();
        const phone = adminForm.phone.trim();
        if (name.length < 2) {
            setAdminError(t('nameRequired'));
            return;
        }
        if (phone.replace(/\D/g, '').length < 9) {
            setAdminError(t('phoneRequired'));
            return;
        }

        setAdminSubmitting(true);
        try {
            const noteHead = t('adminQuickOrderPaymentLabel');
            const extra = adminForm.notes.trim();
            const notesCombined = extra ? `${noteHead}\n${extra}` : noteHead;

            const orderData = {
                userId: currentUser.id,
                customerInfo: {
                    name,
                    phone,
                    email: currentUser.email || '',
                    address: (adminForm.address || '').trim() || '—',
                    notes: notesCombined
                },
                products: cart.map((item) => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.images?.[0] || item.model_3d_url || '',
                    color: item.selectedColor || item.color,
                    size: item.size
                })),
                totalPrice: getTotalPrice(),
                status: 'new',
                payment_status: 'unpaid',
                paymentMethod: 'admin_quick',
                paymentMethodDetail: t('adminQuickOrderPaymentLabel'),
                language,
                createdAt: new Date(),
                source: 'website'
            };

            const orderResult = await createOrder(orderData);
            if (!orderResult.success) throw new Error(orderResult.error || 'Order failed');

            setAdminModalOpen(false);
            clearCart();
            window.alert(t('adminQuickOrderSuccess'));
            setCurrentPage('home');
        } catch (err) {
            if (process.env.NODE_ENV === 'development') {
                // eslint-disable-next-line no-console
                console.error('Admin quick order:', err);
            }
            setAdminError(err.message || t('orderCreationFailed'));
        } finally {
            setAdminSubmitting(false);
        }
    };

    if (cart.length === 0) {
        return (
            <>
                <PageMeta title={t('cart')} description={t('metaDescCart')} siteName={settings?.site_name} />
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
            </>
        );
    }

    return (
        <>
            <PageMeta title={t('cart')} description={t('metaDescCart')} siteName={settings?.site_name} />
            <div className="container mx-auto px-4 md:px-6 py-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-8 text-gray-900">{t('cart') || 'Your Cart'}</h1>

            <div className="grid lg:grid-cols-3 gap-12">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-6">
                    {cart.map(item => {
                        const itemPrice = calculatePrice(item, item.quantity);
                        const discount = Math.round((1 - itemPrice / item.price) * 100);

                        return (
                            <div key={item.cartItemId} className="group bg-white rounded-xl p-4 md:p-6 flex gap-6 border border-gray-100 hover:border-gray-200 transition-colors shadow-sm">
                                <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden relative">
                                    {(item.images && item.images.length > 0) ? (
                                        <img
                                            src={item.images[0]}
                                            alt={item[`name_${language}`] || item.name || ''}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : item.model_3d_url ? (
                                        <model-viewer
                                            src={item.model_3d_url}
                                            alt={item[`name_${language}`] || item.name || ''}
                                            auto-rotate
                                            rotation-per-second="60deg"
                                            interaction-prompt="none"
                                            style={{ width: '100%', height: '100%', backgroundColor: '#f9fafb' }}
                                        ></model-viewer>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 font-bold uppercase text-center p-2">
                                            Tasvir mavjud emas
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                                                {item[`name_${language}`] || item.name || ''}
                                            </h3>
                                            <button
                                                onClick={() => removeFromCart(item.cartItemId)}
                                                className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                                            <span className="text-gray-500">{item.categories?.[`name_${language}`] || item.categories?.name || ''}</span>
                                            {item.size && (
                                                <span className="text-primary font-medium">{t('sku') || 'Kod'}: {item.size}</span>
                                            )}
                                            {(item.selectedColor || item.color) && (
                                                <span className="text-gray-600 font-medium">
                                                    {t('color') || 'Rang'}: <span className="text-secondary uppercase">{translateColor(item.selectedColor || item.color)}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-end justify-between gap-4">
                                        <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
                                            <button
                                                onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                                                className="p-2 hover:bg-white text-gray-600 rounded-l-lg transition-colors border-r border-gray-200"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value);
                                                    if (!isNaN(val)) {
                                                        updateQuantity(item.cartItemId, val);
                                                    }
                                                }}
                                                className="w-12 text-center font-bold text-gray-900 bg-transparent outline-none"
                                            />
                                            <button
                                                onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                                                className="p-2 hover:bg-white text-gray-600 rounded-r-lg transition-colors border-l border-gray-200"
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

                        <div className="space-y-4 mb-6 pt-2">
                            <div className="flex justify-between text-gray-600">
                                <span>{t('subtotal') || 'Jami summa'}</span>
                                <span className="font-medium">${getTotalPrice().toLocaleString()}</span>
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

                        {isAdmin && currentUser ? (
                            <>
                                <p className="text-xs text-amber-900/90 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
                                    {t('adminCheckoutDisabledHint')}
                                </p>
                                <button
                                    type="button"
                                    onClick={openAdminModal}
                                    className="w-full bg-amber-600 text-white py-4 rounded-lg hover:bg-amber-700 transition-all shadow-lg font-bold text-lg flex justify-center items-center gap-2"
                                >
                                    <Shield className="w-5 h-5 shrink-0" />
                                    {t('adminQuickOrder')}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setCurrentPage('checkout')}
                                className="w-full bg-primary text-white py-4 rounded-lg hover:bg-primary-dark transition-all shadow-lg hover:shadow-primary/30 font-bold text-lg flex justify-center items-center group"
                            >
                                {t('checkout')}
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}

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

        {adminModalOpen ? (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="admin-quick-order-title">
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                        <h2 id="admin-quick-order-title" className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-amber-600" />
                            {t('adminQuickOrderTitle')}
                        </h2>
                        <button
                            type="button"
                            onClick={() => !adminSubmitting && setAdminModalOpen(false)}
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                            aria-label={t('adminQuickOrderCancel')}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="px-5 pt-3 text-sm text-gray-600">{t('adminQuickOrderHint')}</p>
                    <form onSubmit={handleAdminQuickOrder} className="p-5 space-y-4">
                        {adminError ? (
                            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{adminError}</div>
                        ) : null}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">{t('name')}</label>
                            <input
                                type="text"
                                value={adminForm.name}
                                onChange={(e) => setAdminForm((f) => ({ ...f, name: e.target.value }))}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2"
                                autoComplete="name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">{t('phone')}</label>
                            <input
                                type="tel"
                                value={adminForm.phone}
                                onChange={(e) => setAdminForm((f) => ({ ...f, phone: e.target.value }))}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2"
                                autoComplete="tel"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">{t('address')}</label>
                            <input
                                type="text"
                                value={adminForm.address}
                                onChange={(e) => setAdminForm((f) => ({ ...f, address: e.target.value }))}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2"
                                placeholder="—"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">{t('notes')}</label>
                            <textarea
                                value={adminForm.notes}
                                onChange={(e) => setAdminForm((f) => ({ ...f, notes: e.target.value }))}
                                rows={3}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 resize-y"
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setAdminModalOpen(false)}
                                disabled={adminSubmitting}
                                className="flex-1 py-3 rounded-lg border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                {t('adminQuickOrderCancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={adminSubmitting}
                                className="flex-1 py-3 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-700 disabled:opacity-50"
                            >
                                {adminSubmitting ? t('processing') : t('adminQuickOrderSubmit')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        ) : null}
        </>
    );
};

export default CartPage;