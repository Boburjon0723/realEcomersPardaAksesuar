import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import PageMeta from '../components/common/PageMeta';

const FaqPage = () => {
    const { t } = useLanguage();
    const { settings } = useApp();
    const [openIndex, setOpenIndex] = useState(null);

    const faqKeys = ['faq1', 'faq2', 'faq3', 'faq4', 'faq5', 'faq6', 'faq7', 'faq8'];

    return (
        <>
            <PageMeta title={t('faq')} description={t('metaDescFaq')} siteName={settings?.site_name} />
            <div className="max-w-4xl mx-auto px-6 md:px-8 py-12">
            <div className="flex items-center gap-3 mb-12">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                    <HelpCircle className="w-7 h-7 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900">
                        {t('faq')}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {t('faqIntro')}
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                {faqKeys.map((key, idx) => {
                    const answerKey = `${key}Answer`;
                    const question = t(key);
                    const answer = t(answerKey);
                    if (!question || question === key) return null;

                    const isOpen = openIndex === idx;
                    return (
                        <div
                            key={idx}
                            className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm"
                        >
                            <button
                                onClick={() => setOpenIndex(isOpen ? null : idx)}
                                className="w-full flex items-center justify-between p-4 md:p-5 text-left hover:bg-gray-50 transition-colors"
                            >
                                <span className="font-semibold text-gray-900 pr-4">{question}</span>
                                <ChevronDown
                                    className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                />
                            </button>
                            {isOpen && (
                                <div className="px-4 md:px-5 pb-4 md:pb-5">
                                    <p className="text-gray-600 leading-relaxed text-sm">
                                        {answer}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
        </>
    );
};

export default FaqPage;
