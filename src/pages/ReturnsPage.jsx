import React from 'react';
import { RotateCcw, Package, CreditCard, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import PageMeta from '../components/common/PageMeta';

const ReturnsPage = () => {
    const { t } = useLanguage();
    const { settings } = useApp();

    const sections = [
        { icon: Clock, titleKey: 'returnsDeadlineTitle', contentKey: 'returnsDeadlineText' },
        { icon: Package, titleKey: 'returnsConditionsTitle', contentKey: 'returnsConditionsText' },
        { icon: RotateCcw, titleKey: 'returnsExchangeTitle', contentKey: 'returnsExchangeText' },
        { icon: CreditCard, titleKey: 'returnsRefundTitle', contentKey: 'returnsRefundText' }
    ];

    return (
        <>
            <PageMeta title={t('returns')} description={t('metaDescReturns')} siteName={settings?.site_name} />
            <div className="max-w-4xl mx-auto px-6 md:px-8 py-12">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-2">
                {t('returns')}
            </h1>
            <p className="text-gray-600 mb-12">
                {t('returnsIntro')}
            </p>

            <div className="space-y-10">
                {sections.map((section, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                <section.icon className="w-6 h-6 text-primary" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">{t(section.titleKey)}</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                            {t(section.contentKey)}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-12 p-6 bg-primary/5 rounded-2xl border border-primary/20">
                <p className="text-gray-700 leading-relaxed">
                    {t('returnsContact')}
                </p>
                <p className="mt-2 font-semibold text-primary">
                    {settings?.phone || '+998 90 123 45 67'} | {settings?.email || 'info@nuurhome.uz'}
                </p>
            </div>
        </div>
        </>
    );
};

export default ReturnsPage;
