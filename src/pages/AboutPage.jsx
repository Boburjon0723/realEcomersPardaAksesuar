import React from 'react';
import { Award, Users, TrendingUp, Heart, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';

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
        <div className="font-sans">
            {/* Hero Section */}
            <div className="relative bg-gray-900 text-white py-24 px-4 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-40">
                    <img
                        src={settings?.about_hero_image || "https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"}
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

                {/* Mission & Vision */}
                <div className="grid md:grid-cols-2 gap-16 mb-24 items-center">
                    <div>
                        <span className="text-secondary font-bold tracking-wider uppercase text-sm mb-2 block">Our Story</span>
                        <h2 className="text-3xl font-display font-bold mb-6 text-gray-900">
                            {settings?.about_mission_title || t('ourMission') || 'Crafting details that matter'}
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-6 text-lg">
                            {settings?.about_mission_text1 || t('missionText1') || 'Started as a small family business, we have grown into a leading provider of high-quality curtain accessories. We believe that the smallest details can make the biggest difference in interior design.'}
                        </p>
                        <p className="text-gray-600 leading-relaxed text-lg">
                            {settings?.about_mission_text2 || t('missionText2') || 'Our mission is to provide an extensive selection of stylish, durable, and affordable accessories that help our customers express their unique style.'}
                        </p>
                    </div>
                    <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-video">
                        <img
                            src={settings?.about_mission_image || "https://images.unsplash.com/photo-1615800098779-1be4350c5957?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"}
                            alt="Our Workshop"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Values */}
                <div className="bg-gray-50 rounded-3xl p-12 md:p-16 mb-16">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-display font-bold mb-4 text-gray-900">{t('ourValues') || 'Why Choose Us'}</h2>
                        <p className="text-gray-600">We are committed to excellence in every aspect of our business, from product quality to customer service.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                        {[
                            {
                                title: settings?.value1_title || t('quality') || 'Premium Quality',
                                desc: settings?.value1_desc || t('qualityDesc') || 'We use only the finest materials to ensure durability and lasting beauty.'
                            },
                            {
                                title: settings?.value2_title || t('service') || 'Customer First',
                                desc: settings?.value2_desc || t('serviceDesc') || 'Your satisfaction is our top priority. We are here to help you every step of the way.'
                            },
                            {
                                title: settings?.value3_title || t('innovation') || 'Modern Design',
                                desc: settings?.value3_desc || t('innovationDesc') || 'We constantly update our collections to reflect the latest trends in interior design.'
                            }
                        ].map((value, idx) => (
                            <div key={idx} className="flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                        <CheckCircle className="w-6 h-6" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold mb-2 text-gray-900">{value.title}</h4>
                                    <p className="text-gray-600 leading-relaxed">{value.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;