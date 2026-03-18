import React from 'react';
import { Award, Users, TrendingUp, Heart, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import PageMeta from '../components/common/PageMeta';
import aboutLuxuryLivingImage from '../assets/images/hero-luxury-living-room.png';
import aboutCurtainImage from '../assets/images/about-curtain-accessories.png';

const AboutPage = () => {
    const { t } = useLanguage();
    const { settings } = useApp();

    const stats = [
        { icon: Users, label: settings?.stat1_label || t('happyCustomers') || 'Happy Customers', value: settings?.stat1_value || '10,000+' },
        { icon: Award, label: settings?.stat2_label || t('yearsExperience') || 'Years Experience', value: settings?.stat2_value || '15+' },
        { icon: TrendingUp, label: settings?.stat3_label || t('productsAvailable') || 'Products', value: settings?.stat3_value || '5,000+' },
        { icon: Heart, label: settings?.stat4_label || t('positiveReviews') || 'Positive Reviews', value: settings?.stat4_value || '98%' }
    ];

    return (
        <>
            <PageMeta title={t('about')} description={t('metaDescAbout')} siteName={settings?.site_name} />
            <div className="font-sans">
            {/* Hero Section */}
            <div className="relative bg-gray-900 text-white py-24 px-4 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-40">
                    <img
                        src={settings?.about_hero_image || aboutLuxuryLivingImage}
                        alt="Curtain Background"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="container mx-auto relative z-10 text-center max-w-3xl">
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
                        {settings?.about_hero_title || t('aboutTitle') || 'We bring elegance to your home'}
                    </h1>
                    <p className="text-xl text-white/80 leading-relaxed">
                        {settings?.about_hero_subtitle || t('aboutSubtitle') || 'Specializing in premium curtain accessories that transform your living space into a masterpiece of design and comfort.'}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-6 py-16">
                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-8 -mt-24 mb-20 relative z-20">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100 transform hover:-translate-y-1 transition-transform">
                            <stat.icon className="w-10 h-10 mx-auto mb-4 text-primary" />
                            <div className="text-4xl font-display font-bold text-gray-900 mb-2">{stat.value}</div>
                            <div className="text-gray-500 font-medium">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Nuur Home — Kompaniya haqida (til almashganda avtomatik o'zgaradi) */}
                <div className="grid md:grid-cols-2 gap-16 mb-24 items-center">
                    <div>
                        <span className="text-secondary font-bold tracking-wider uppercase text-sm mb-2 block">Nuur Home Collection</span>
                        <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                            {t('aboutCompanyIntro')}
                        </p>
                        <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                            {t('aboutCompanyPhilosophy')}
                        </p>
                        <p className="text-gray-700 leading-relaxed text-lg">
                            {t('aboutCompanyMaterials')}
                        </p>
                    </div>
                    <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-video">
                        <img
                            src={settings?.about_mission_image || aboutCurtainImage}
                            alt="Nuur Home Collection - Parda aksessuarlari"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Tajriba va eksport */}
                <div className="max-w-3xl mx-auto mb-24">
                    <p className="text-gray-700 leading-relaxed text-lg">
                        {t('aboutCompanyExperience')}
                    </p>
                </div>

                {/* Qadriyatlar */}
                <div className="bg-gray-50 rounded-3xl p-12 md:p-16 mb-16">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <h2 className="text-3xl font-display font-bold mb-4 text-gray-900">{t('aboutValuesTitle')}</h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[t('aboutValue1'), t('aboutValue2'), t('aboutValue3'), t('aboutValue4')].map((value, idx) => (
                            <div key={idx} className="flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                        <CheckCircle className="w-6 h-6" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-gray-700 leading-relaxed font-medium">{value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="text-center text-xl font-display font-semibold text-primary mt-12">
                        {t('aboutCompanyClosing')}
                    </p>
                </div>
            </div>
        </div>
        </>
    );
};

export default AboutPage;