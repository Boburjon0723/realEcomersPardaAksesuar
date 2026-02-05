import React from 'react';
import { Truck, Shield, CreditCard, Headphones, Clock, Gift } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const ServicesPage = () => {
    const { t } = useLanguage();

    const services = [
        {
            icon: Truck,
            title: t('freeDelivery'),
            desc: t('freeDeliveryDesc'),
            color: 'bg-primary'
        },
        {
            icon: Shield,
            title: t('warranty'),
            desc: t('warrantyDesc'),
            color: 'bg-secondary'
        },
        {
            icon: CreditCard,
            title: t('easyPayment'),
            desc: t('easyPaymentDesc'),
            color: 'bg-gray-800'
        },
        {
            icon: Headphones,
            title: t('support247'),
            desc: t('support247Desc'),
            color: 'bg-primary'
        },
        {
            icon: Clock,
            title: t('fastService'),
            desc: t('fastServiceDesc'),
            color: 'bg-secondary'
        },
        {
            icon: Gift,
            title: t('bonusProgram'),
            desc: t('bonusProgramDesc'),
            color: 'bg-gray-800'
        }
    ];

    return (
        <div className="container mx-auto px-4 md:px-6 py-12">
            <h1 className="text-4xl font-display font-bold mb-4 text-gray-900 text-center">{t('services')}</h1>
            <p className="text-xl text-gray-500 text-center mb-16 max-w-2xl mx-auto">{t('servicesSubtitle') || 'We provide exceptional services to ensure your shopping experience is as perfect as our products.'}</p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {services.map((service, idx) => (
                    <div
                        key={idx}
                        className="bg-white rounded-xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 group"
                    >
                        <div className={`w-16 h-16 ${service.color} rounded-2xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform`}>
                            <service.icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-gray-900">{service.title}</h3>
                        <p className="text-gray-600 leading-relaxed text-lg">{service.desc}</p>
                    </div>
                ))}
            </div>

            {/* CTA Section */}
            <div className="relative bg-primary rounded-3xl p-12 overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-secondary opacity-20 rounded-full blur-3xl"></div>

                <div className="relative z-10 text-center max-w-3xl mx-auto text-white">
                    <h2 className="text-3xl font-display font-bold mb-6">{t('needHelp') || 'Process Custom Order?'}</h2>
                    <p className="text-xl mb-8 text-white/90">{t('contactUsAnytime') || 'We specialize in custom curtain designs. Contact our experts to bring your vision to life.'}</p>
                    <button className="bg-white text-primary px-10 py-4 rounded-lg font-bold text-lg hover:bg-gray-50 transition shadow-lg hover:shadow-xl">
                        {t('contactUs') || 'Get a Quote'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ServicesPage;