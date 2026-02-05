import React, { useState, useEffect } from 'react';
import { Check, CreditCard, AlertCircle, X, Upload, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { createOrder, uploadReceipt } from '../services/supabase/orders';
import { getSettings } from '../services/supabase/settings';

const CheckoutPage = () => {
    const { cart, getTotalPrice, clearCart, setCurrentPage, currentUser, setShowAuth } = useApp();
    const { language, t } = useLanguage();
    const [paymentMethod, setPaymentMethod] = useState('humo');
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [receiptFile, setReceiptFile] = useState(null);
    const [settings, setSettings] = useState(null);
    const [formData, setFormData] = useState({
        name: currentUser?.name || '',
        phone: currentUser?.phone || '', // Taking phone from user if available
        email: currentUser?.email || '',
        address: '',
        city: '',
        notes: ''
    });

    useEffect(() => {
        if (!currentUser) {
            setShowAuth(true);
            setCurrentPage('home'); // Redirect to home so they don't see checkout without login
            // Or ideally, stay on checkout but show modal. 
            // But usually checkout is protected. 
            // Let's redirect to home and show auth.
        }
    }, [currentUser, setShowAuth, setCurrentPage]);

    useEffect(() => {
        const fetchSettings = async () => {
            // ... existing code ...
            const result = await getSettings();
            if (result.success) {
                setSettings(result.settings);
            }
        };
        fetchSettings();
    }, []);

    const validateForm = () => {
        if (!formData.name.trim()) {
            setError(t('nameRequired'));
            return false;
        }
        if (!formData.phone.trim()) {
            setError(t('phoneRequired'));
            return false;
        }
        if (!formData.address.trim()) {
            setError(t('addressRequired'));
            return false;
        }
        if (!formData.city.trim()) {
            setError(t('cityRequired'));
            return false;
        }
        if (!receiptFile) {
            setError(language === 'uz' ? "Iltimos, to'lov chekini yuklang" : 'Please upload payment receipt');
            return false;
        }
        return true;
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError(language === 'uz' ? 'Fayl hajmi 5MB dan oshmasligi kerak' : 'File size should not exceed 5MB');
                return;
            }
            setReceiptFile(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!validateForm()) return;

        setLoading(true);
        try {
            const orderData = {
                userId: currentUser?.id || 'guest',
                customerInfo: { ...formData, address: `${formData.city}, ${formData.address}` },
                products: cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.images[0]
                })),
                totalPrice: getTotalPrice(),
                status: 'new',
                payment_status: 'unpaid',
                paymentMethod: paymentMethod,
                paymentMethodDetail: settings?.[`${paymentMethod}_card`] || '',
                language: language,
                createdAt: new Date()
            };

            const orderResult = await createOrder(orderData);
            if (!orderResult.success) throw new Error(orderResult.error || t('orderCreationFailed'));

            const orderId = orderResult.orderId;

            // Upload receipt if provided
            if (receiptFile) {
                console.log('Uploading receipt for order:', orderId);
                const uploadResult = await uploadReceipt(orderId, receiptFile);

                if (!uploadResult.success) {
                    console.error('Receipt upload failed:', uploadResult.error);
                    throw new Error(`Order created but receipt upload failed: ${uploadResult.error}`);
                }

                console.log('Receipt uploaded successfully:', uploadResult.url);
            }

            setOrderSuccess(true);
            clearCart();
            setTimeout(() => setCurrentPage('home'), 4000);

        } catch (err) {
            console.error('Checkout error:', err);
            setError(err.message || t('unknownError'));
        } finally {
            setLoading(false);
        }
    };

    const getCardNumber = (method) => {
        if (!settings) return '...';
        return settings[`${method}_card`] || (language === 'uz' ? 'Karta raqami kiritilmagan' : 'Card number not set');
    };

    if (orderSuccess) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 max-w-2xl mx-auto">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-fade-in">
                    <Check className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-display font-bold mb-4 text-gray-900">{t('orderSuccess') || 'Order Successful!'}</h2>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                    {language === 'uz'
                        ? 'Buyurtmangiz muvaffaqiyatli qabul qilindi. To\'lov cheki tasdiqlangach, operatorlarimiz siz bilan bog\'lanishadi.'
                        : 'Your order has been collected perfectly. Our team will review the receipt and contact you shortly.'}
                </p>
                <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
                    <div className="bg-primary h-full w-full animate-[shimmer_2s_infinite]"></div>
                </div>
                <p className="text-sm text-gray-400 mt-2">{t('redirecting')}...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 md:px-6 py-8">
            <button
                onClick={() => setCurrentPage('cart')}
                className="flex items-center text-gray-500 hover:text-primary mb-6 transition-colors font-medium"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('backToCart') || 'Back to Cart'}
            </button>

            <h1 className="text-3xl md:text-4xl font-display font-bold mb-8 text-gray-900">{t('checkout')}</h1>

            {error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 animate-fade-in">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <h3 className="font-bold text-red-800">{t('error')}</h3>
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                    <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Section 1: Personal Info */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                            <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center">
                                <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">1</span>
                                {t('personalInfo')}
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('name')} *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('phone')} *</label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        placeholder="+998"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('email')}</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Delivery */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                            <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center">
                                <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">2</span>
                                {t('deliveryInfo')}
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('city')} *</label>
                                    <select
                                        required
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    >
                                        <option value="">{t('selectCity')}</option>
                                        <option value="Tashkent">Tashkent</option>
                                        <option value="Samarkand">Samarkand</option>
                                        <option value="Bukhara">Bukhara</option>
                                        {/* Add other cities */}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('address')} *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('notes')}</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        rows="2"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Payment */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                            <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center">
                                <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">3</span>
                                {t('paymentMethod')}
                            </h3>

                            <div className="grid grid-cols-3 gap-4 mb-8">
                                {['humo', 'uzcard', 'visa'].map(method => (
                                    <label key={method} className={`relative flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === method
                                        ? 'border-primary bg-primary/5 shadow-md'
                                        : 'border-gray-200 hover:border-primary/50'
                                        }`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value={method}
                                            checked={paymentMethod === method}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="absolute opacity-0"
                                        />
                                        <span className="font-bold uppercase text-sm mb-1">{method}</span>
                                        {paymentMethod === method && <Check className="w-4 h-4 text-primary absolute top-2 right-2" />}
                                    </label>
                                ))}
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Card Number</span>
                                    <button
                                        type="button"
                                        className="text-primary text-sm font-bold hover:underline"
                                        onClick={() => navigator.clipboard.writeText(getCardNumber(paymentMethod))}
                                    >
                                        Copy
                                    </button>
                                </div>
                                <div className="font-mono text-xl md:text-2xl text-gray-800 tracking-widest break-all">
                                    {getCardNumber(paymentMethod)}
                                </div>
                            </div>

                            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${receiptFile ? 'border-green-500 bg-green-50/50' : 'border-gray-300 hover:border-primary bg-gray-50'}`}>
                                <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="receipt-upload"
                                />
                                <label htmlFor="receipt-upload" className="cursor-pointer flex flex-col items-center">
                                    {receiptFile ? (
                                        <>
                                            <Check className="w-10 h-10 text-green-500 mb-2" />
                                            <span className="font-bold text-green-700">{receiptFile.name}</span>
                                            <span className="text-sm text-green-600">Click to change</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-10 h-10 text-gray-400 mb-2" />
                                            <span className="font-bold text-gray-700">Upload Payment Receipt</span>
                                            <span className="text-sm text-gray-500">Screenshot or PDF (Max 5MB)</span>
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center space-x-2 transition-all ${loading || !receiptFile
                                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                                : 'bg-primary hover:bg-primary-dark text-white hover:translate-y-[-2px] hover:shadow-xl'
                                }`}
                        >
                            {loading ? (
                                <span>Processing...</span>
                            ) : (
                                <>
                                    <span>Confirm Order</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Summary Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24 border border-gray-100">
                        <h3 className="font-bold text-lg mb-6 text-gray-900 pb-4 border-b border-gray-100 flex items-center">
                            <CreditCard className="w-5 h-5 mr-2 text-primary" />
                            {t('orderSummary')}
                        </h3>
                        <div className="space-y-4 mb-6 custom-scrollbar max-h-96 overflow-y-auto">
                            {cart.map(item => (
                                <div key={item.id} className="flex gap-3">
                                    <img
                                        src={item.images[0]}
                                        className="w-14 h-14 object-cover rounded-md bg-gray-50"
                                        alt=""
                                    />
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-gray-900 line-clamp-1">{item.name[language]}</div>
                                        <div className="text-xs text-gray-500">${item.price?.toLocaleString()} x {item.quantity}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="pt-4 border-t border-gray-100 space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span>${getTotalPrice().toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm text-green-600 font-bold">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                            <div className="flex justify-between text-xl font-black text-primary pt-2 mt-2 border-t border-gray-100">
                                <span>Total</span>
                                <span>${getTotalPrice().toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                            <ShieldCheck className="w-4 h-4 text-primary" />
                            Secure SSL Encryption
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
