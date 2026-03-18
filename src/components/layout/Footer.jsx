import React from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Send, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApp } from '../../contexts/AppContext';

const Footer = () => {
    const { t } = useLanguage();
    const { settings, setCurrentPage } = useApp();

    const handleNavigation = (e, page) => {
        e.preventDefault();
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    return (
        <footer className="bg-gray-900 text-white pt-12 pb-6 mt-auto">
            <div className="container mx-auto px-6 md:px-10 lg:px-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">

                    {/* Brand Column */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl p-1.5 shrink-0">
                                {settings.logo_url ? (
                                    <img src={settings.logo_url} alt={settings.site_name} className="w-full h-full object-contain" />
                                ) : (
                                    <img src="/favicon.svg" alt="Nuur Home Logo" className="w-full h-full object-contain" />
                                )}
                            </div>
                            <span className="text-sm md:text-base font-display font-bold text-white tracking-tight">
                                {settings.site_name || 'Nuur Home'}
                            </span>
                        </div>
                        <p className="text-gray-400 text-xs leading-relaxed mb-4">
                            {t('footerDescription')}
                        </p>
                        <div className="flex gap-2">
                            {settings.facebook_url && (
                                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300">
                                    <Facebook className="w-4 h-4" />
                                </a>
                            )}
                            {settings.instagram_url && (
                                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all duration-300">
                                    <Instagram className="w-4 h-4" />
                                </a>
                            )}
                            {settings.telegram_url && (
                                <a href={settings.telegram_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-400 hover:text-white transition-all duration-300">
                                    <Send className="w-4 h-4" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-sm font-bold mb-4 text-white border-l-4 border-secondary pl-2">
                            {t('quickLinks')}
                        </h4>
                        <ul className="space-y-2">
                            {[
                                { key: 'home', page: 'home' },
                                { key: 'shop', page: 'shop' },
                                { key: 'about', page: 'about' },
                                { key: 'contact', page: 'contact' }
                            ].map((item) => (
                                <li key={item.key}>
                                    <a
                                        href={`#${item.page}`}
                                        onClick={(e) => handleNavigation(e, item.page)}
                                        className="flex items-center text-gray-400 hover:text-secondary transition-colors group cursor-pointer text-xs"
                                    >
                                        <ChevronRight className="w-3.5 h-3.5 mr-1.5 text-gray-600 group-hover:text-secondary opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                                        {t(item.key)}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h4 className="text-sm font-bold mb-4 text-white border-l-4 border-secondary pl-2">
                            {t('customerService')}
                        </h4>
                        <ul className="space-y-2">
                            {['shipping', 'returns', 'faq', 'terms', 'privacy'].map((key) => (
                                <li key={key}>
                                    <button
                                        onClick={() => setCurrentPage(key)}
                                        className="flex items-center text-gray-400 hover:text-secondary transition-colors group w-full text-left text-xs"
                                    >
                                        <ChevronRight className="w-3.5 h-3.5 mr-1.5 text-gray-600 group-hover:text-secondary opacity-0 group-hover:opacity-100 transition-all font-bold shrink-0" />
                                        {t(key)}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 text-white border-l-4 border-secondary pl-3">
                            {t('contactUs')}
                        </h4>
                        <ul className="space-y-4">
                            <li className="flex items-start">
                                <MapPin className="w-5 h-5 text-secondary mr-3 mt-1 flex-shrink-0" />
                                <span className="text-gray-400">{settings.address || "Tashkent, Uzbekistan"}</span>
                            </li>
                            <li className="flex items-center">
                                <Phone className="w-5 h-5 text-secondary mr-3 flex-shrink-0" />
                                <span className="text-gray-400">{settings.phone || "+998 90 123 45 67"}</span>
                            </li>
                            <li className="flex items-center">
                                <Mail className="w-5 h-5 text-secondary mr-3 flex-shrink-0" />
                                <span className="text-gray-400">{settings.email || "info@nuurhome.uz"}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-6 mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-xs mb-0">
                        &copy; {new Date().getFullYear()} {settings.site_name || 'Nuur Home'}. {t('allRightsReserved')}
                    </p>
                    <div className="flex items-center gap-1.5 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
                        {/* Payment Method Placeholders */}
                        <div className="h-6 w-10 bg-white rounded flex items-center justify-center"><span className="text-[10px] font-bold text-gray-800">VISA</span></div>
                        <div className="h-6 w-10 bg-white rounded flex items-center justify-center"><span className="text-[10px] font-bold text-gray-800">MC</span></div>
                        <div className="h-6 w-10 bg-white rounded flex items-center justify-center"><span className="text-[10px] font-bold text-gray-800">PAYME</span></div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;