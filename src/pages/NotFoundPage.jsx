import React from 'react';
import { Home, Search } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../hooks/useApp';
import PageMeta from '../components/common/PageMeta';

const NotFoundPage = () => {
    const { t, language } = useLanguage();
    const { setCurrentPage, settings } = useApp();

    const notFoundMessage =
        language === 'uz'
            ? "Siz qidirgan sahifa topilmadi yoki o'chirilgan. Bosh sahifaga qayting yoki mahsulotlar katalogini ko'zdan kechiring."
            : language === 'ru'
            ? "Запрашиваемая страница не найдена или удалена. Вернитесь на главную или просмотрите каталог товаров."
            : "The page you're looking for doesn't exist or was removed. Return home or browse our product catalog.";

    return (
        <>
            <PageMeta title={t('notFoundTitle')} description={t('metaDescNotFound')} siteName={settings?.site_name} />
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
                <div className="text-8xl font-display font-bold text-primary/20 mb-4">404</div>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-3">
                    {t('notFoundTitle')}
                </h1>
                <p className="text-gray-500 mb-8 max-w-md">{notFoundMessage}</p>
                <div className="flex flex-wrap justify-center gap-4">
                    <button
                        onClick={() => setCurrentPage('home')}
                        className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                    >
                        <Home className="w-5 h-5" />
                        {t('home')}
                    </button>
                    <button
                        onClick={() => setCurrentPage('shop')}
                        className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                    >
                        <Search className="w-5 h-5" />
                        {t('shop')}
                    </button>
                </div>
            </div>
        </>
    );
};

export default NotFoundPage;
