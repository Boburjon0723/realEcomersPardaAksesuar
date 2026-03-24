import React from 'react';
import { Shield } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../hooks/useApp';
import PageMeta from '../components/common/PageMeta';
import PageBackBar from '../components/common/PageBackBar';

const PrivacyPage = () => {
    const { t } = useLanguage();
    const { settings } = useApp();

    const sections = ['privacy1', 'privacy2', 'privacy3', 'privacy4', 'privacy5'];

    return (
        <>
            <PageMeta title={t('privacy')} description={t('metaDescPrivacy')} siteName={settings?.site_name} />
            <div className="max-w-4xl mx-auto px-6 md:px-8 py-12">
            <PageBackBar />
            <div className="flex items-center gap-3 mb-12">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Shield className="w-7 h-7 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900">
                        {t('privacy')}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {t('privacyIntro')}
                    </p>
                </div>
            </div>

            <div className="space-y-8">
                {sections.map((key, idx) => {
                    const content = t(key);
                    const titleKey = `${key}Title`;
                    const title = t(titleKey);
                    if (!content || content === key) return null;
                    return (
                        <div key={idx} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                            {title && title !== titleKey && (
                                <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
                            )}
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">
                                {content}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
        </>
    );
};

export default PrivacyPage;
