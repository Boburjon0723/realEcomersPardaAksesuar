import React from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApp } from '../../hooks/useApp';

/**
 * Qo'llab quvvatlash sahifalari uchun ortga qaytish va yopish tugmalari
 */
const PageBackBar = () => {
    const { t } = useLanguage();
    const { setCurrentPage } = useApp();

    const goBack = () => {
        setCurrentPage('home');
        window.scrollTo(0, 0);
    };

    return (
        <div className="flex items-center justify-between mb-6 md:mb-8">
            <button
                onClick={goBack}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors font-medium text-sm"
            >
                <ArrowLeft className="w-4 h-4" />
                {t('back') || "Ortga qaytish"}
            </button>
            <button
                onClick={goBack}
                className="p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                title={t('close') || "Yopish"}
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    );
};

export default PageBackBar;
