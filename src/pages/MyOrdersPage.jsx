import React, { useState, useEffect } from 'react';
import { Package, Calendar, ArrowLeft, ShoppingBag, ExternalLink } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getUserOrders } from '../services/supabase/orders';

const MyOrdersPage = () => {
    const { currentUser, setCurrentPage, language } = useApp();
    const { t } = useLanguage();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) {
            setCurrentPage('home');
            return;
        }

        const fetchOrders = async () => {
            setLoading(true);
            const result = await getUserOrders(currentUser.id);
            if (result.success) {
                setOrders(result.orders);
            } else {
                console.error(result.error);
            }
            setLoading(false);
        };

        fetchOrders();
    }, [currentUser, setCurrentPage]);

    const getStatusColor = (status) => {
        const colors = {
            'new': 'bg-blue-100 text-blue-700',
            'yangi': 'bg-blue-100 text-blue-700',
            'pending': 'bg-yellow-100 text-yellow-700',
            'jarayonda': 'bg-yellow-100 text-yellow-700',
            'completed': 'bg-green-100 text-green-700',
            'yakunlangan': 'bg-green-100 text-green-700',
            'cancelled': 'bg-red-100 text-red-700',
            'bekor_qilingan': 'bg-red-100 text-red-700'
        };
        return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(language === 'uz' ? 'uz-UZ' : language === 'ru' ? 'ru-RU' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 md:px-6 py-12 max-w-4xl">
            <button
                onClick={() => setCurrentPage('home')}
                className="flex items-center text-gray-500 hover:text-primary mb-8 transition-colors group"
            >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                {t('backToShop') || 'Back to Shop'}
            </button>

            <div className="flex items-center justify-between mb-10">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 flex items-center">
                    <ShoppingBag className="w-8 h-8 mr-3 text-primary" />
                    {t('myOrders') || 'My Orders'}
                </h1>
                <span className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full text-sm font-bold">
                    {orders.length} {t('items') || 'items'}
                </span>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t('noOrders') || 'No orders yet'}</h3>
                    <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                        {language === 'uz' ? "Siz hali buyurtma bermagansiz. Do'konimizda o'zingizga yoqqan mahsulotlarni toping." : language === 'ru' ? "Вы еще не делали заказов. Найдите товары, которые вам нравятся в нашем магазине." : "You haven't placed any orders yet. Find products you like in our shop."}
                    </p>
                    <button
                        onClick={() => setCurrentPage('shop')}
                        className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-md hover:shadow-lg"
                    >
                        {t('shopNow') || 'Shop Now'}
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6 md:p-8">
                                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center">
                                            <Package className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">#{order.id.slice(0, 8).toUpperCase()}</div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Calendar className="w-4 h-4 mr-1.5" />
                                                {formatDate(order.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                                        {t(order.status?.toLowerCase()) || order.status}
                                    </div>
                                </div>

                                <div className="border-t border-b border-gray-50 py-6 my-6">
                                    <div className="space-y-4">
                                        {order.products?.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between group">
                                                <div className="flex items-center space-x-4">
                                                    <img
                                                        src={item.image || "/favicon.svg"}
                                                        alt={item.name}
                                                        className="w-14 h-14 object-cover rounded-lg bg-gray-50"
                                                    />
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors cursor-pointer capitalize">
                                                            {typeof item.name === 'object' ? item.name[language] || item.name.uz : item.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            ${item.price.toLocaleString()} x {item.quantity}
                                                            {item.color && (
                                                                <span className="ml-2 px-1.5 py-0.5 bg-gray-100 rounded text-secondary font-bold uppercase text-[10px]">
                                                                    {item.color}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-sm font-black text-gray-900">
                                                    ${(item.price * item.quantity).toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">{t('total') || 'Total'}</div>
                                        <div className="text-2xl font-black text-primary">${order.totalAmount.toLocaleString()}</div>
                                    </div>
                                    {order.receipt_url && (
                                        <a
                                            href={order.receipt_url || '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-xs font-bold text-secondary hover:text-primary transition-colors bg-gray-50 px-4 py-2 rounded-lg"
                                        >
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            {language === 'uz' ? "To'lov cheki" : language === 'ru' ? "Чек оплаты" : "Payment Receipt"}
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrdersPage;
