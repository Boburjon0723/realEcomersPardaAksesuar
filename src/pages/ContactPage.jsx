import React, { useMemo, useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, ExternalLink, QrCode, Copy, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../hooks/useApp';
import PageMeta from '../components/common/PageMeta';
import { createContactMessage } from '../services/supabase/messages';
import { getContactMapEmbedUrl, getContactMapExternalUrl } from '../utils/contactMap';

const ContactPage = () => {
    const { t } = useLanguage();
    const { settings } = useApp(); // Get settings from context

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [copied, setCopied] = useState(false);
    const websiteUrl = 'https://nuur-home-collection.vercel.app/';
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=640x640&data=${encodeURIComponent(websiteUrl)}`;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(websiteUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
        } catch (_) {
            setCopied(false);
        }
    };

    const validateContactForm = () => {
        const errs = {};
        if (!formData.name.trim()) errs.name = t('nameRequired') || "Ism kiritilishi shart";
        else if (formData.name.trim().length < 2) errs.name = t('nameMinLength') || "Ism kamida 2 ta belgidan iborat bo'lishi kerak";
        if (!formData.email.trim()) errs.email = t('emailRequired') || "Email kiritilishi shart";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = t('emailInvalid') || "To'g'ri email kiriting";
        if (!formData.phone.trim()) errs.phone = t('phoneRequired') || "Telefon raqam shart";
        else if ((formData.phone.replace(/\D/g, '').length < 9)) errs.phone = t('phoneInvalid') || "To'g'ri telefon raqam kiriting (kamida 9 ta raqam)";
        if (!formData.message.trim()) errs.message = t('messageRequired') || "Xabar kiritilishi shart";
        else if (formData.message.trim().length < 10) errs.message = t('messageMinLength') || "Xabar kamida 10 ta belgidan iborat bo'lishi kerak";
        setFieldErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});
        if (!validateContactForm()) return;
        setLoading(true);

        try {
            const result = await createContactMessage(formData);

            if (!result.success) {
                throw new Error(result.error || 'Failed to send message');
            }

            setSubmitted(true);
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
            setTimeout(() => setSubmitted(false), 5000);
        } catch (err) {
            console.error('Contact form error:', err);
            setError(err.message || 'Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const mapEmbedUrl = useMemo(() => getContactMapEmbedUrl(settings), [settings]);
    const mapExternalUrl = useMemo(() => getContactMapExternalUrl(settings), [settings]);

    const contactInfo = [
        {
            icon: MapPin,
            title: t('address') || 'Address',
            content: settings?.address || 'Toshkent, Amir Temur 123',
            link: '#'
        },
        {
            icon: Phone,
            title: t('phone') || 'Phone',
            content: settings?.phone || '+998 90 123 45 67',
            link: settings?.phone ? `tel:${settings.phone.replace(/\s/g, '')}` : null
        },
        {
            icon: Mail,
            title: t('email') || 'Email',
            content: settings?.email || 'info@pardacenter.uz',
            link: settings?.email ? `mailto:${settings.email}` : 'mailto:info@pardacenter.uz'
        },
        {
            icon: Clock,
            title: t('workingHours') || 'Working Hours',
            content: settings?.work_hours || 'Mon - Sat: 9:00 - 18:00',
            link: null
        }
    ];

    return (
        <>
            <PageMeta title={t('contact')} description={t('metaDescContact')} siteName={settings?.site_name} />
            <div className="container mx-auto px-4 md:px-6 py-12">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <h1 className="text-4xl font-display font-bold mb-4 text-gray-900">{t('contact') || 'Contact Us'}</h1>
                <p className="text-xl text-gray-600">{t('contactSubtitle') || 'Have questions? We stick by your side to help you choosing the best for your home.'}</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                {/* Contact Info & Map */}
                <div className="space-y-8">
                    <div className="grid sm:grid-cols-2 gap-6">
                        {contactInfo.map((info, idx) => (
                            <a
                                key={idx}
                                href={info.link || undefined}
                                className={`bg-white p-6 rounded-xl border border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all group ${!info.link ? 'cursor-default' : ''}`}
                            >
                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                                    <info.icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">{info.title}</h3>
                                <p className="text-gray-500 font-medium">{info.content}</p>
                            </a>
                        ))}
                    </div>

                    {/* Xarita: settings (latitude/longitude) yoki manzil; ixtiyoriy REACT_APP_CONTACT_MAP_EMBED_URL */}
                    <div className="bg-gray-100 rounded-2xl overflow-hidden h-80 relative group border border-gray-100">
                        {mapEmbedUrl ? (
                            <iframe
                                title={t('mapPlaceholder')}
                                src={mapEmbedUrl}
                                className="absolute inset-0 w-full h-full border-0"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                allowFullScreen
                            />
                        ) : (
                            <>
                                <img
                                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                                    alt=""
                                    className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 transition-all duration-500"
                                />
                                <div className="absolute inset-0 flex items-center justify-center p-4">
                                    <div className="bg-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 max-w-[90%]">
                                        <MapPin className="w-5 h-5 text-primary shrink-0" />
                                        <span className="font-bold text-gray-900 text-center text-sm sm:text-base">
                                            {t('contactMapFallback')}
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                        {mapExternalUrl && (
                            <a
                                href={mapExternalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-2 text-xs font-semibold text-primary shadow-md hover:bg-white transition-colors"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                {t('openInMaps')}
                            </a>
                        )}
                    </div>

                    {/* Website QR Card */}
                    <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-5 sm:p-6 shadow-sm">
                        <div className="pointer-events-none absolute -top-14 -right-10 h-36 w-36 rounded-full bg-emerald-100/70 blur-2xl" />
                        <div className="pointer-events-none absolute -bottom-12 -left-10 h-36 w-36 rounded-full bg-cyan-100/70 blur-2xl" />
                        <div className="relative z-10 grid sm:grid-cols-[1fr_auto] gap-5 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-[11px] font-bold text-emerald-700">
                                    <QrCode className="w-3.5 h-3.5" />
                                    E-Commerce QR
                                </div>
                                <h3 className="mt-3 text-xl font-bold text-gray-900">
                                    Saytga tez kirish uchun QR kod
                                </h3>
                                <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                                    Mijoz telefonidan skaner qilib, katalogga bir zumda o‘tadi.
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <a
                                        href={websiteUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Saytni ochish
                                    </a>
                                    <button
                                        type="button"
                                        onClick={handleCopyLink}
                                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                        {copied ? 'Nusxalandi' : 'Linkni nusxalash'}
                                    </button>
                                </div>
                                <p className="mt-3 text-xs text-gray-500 break-all">{websiteUrl}</p>
                            </div>
                            <div className="relative mx-auto sm:mx-0">
                                <div className="rounded-2xl border border-white bg-white p-3 shadow-lg">
                                    <img
                                        src={qrImageUrl}
                                        alt="Nuur Home Collection QR"
                                        className="h-40 w-40 sm:h-44 sm:w-44 rounded-lg object-cover"
                                        loading="lazy"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
                    <div className="flex items-center gap-3 mb-8">
                        <MessageSquare className="w-6 h-6 text-secondary" />
                        <h2 className="text-2xl font-bold text-gray-900">{t('sendMessage') || 'Send us a message'}</h2>
                    </div>

                    {submitted && (
                        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center">
                            {/* <CheckCircle className="w-5 h-5 mr-2" /> */}
                            {t('messageSent') || 'Message sent successfully!'}
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">{t('name')}</label>
                            <input
                                type="text"
                                required
                                className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none ${fieldErrors.name ? 'border-red-400' : 'border-gray-200'}`}
                                placeholder={t('namePlaceholder')}
                                value={formData.name}
                                onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setFieldErrors(prev => ({ ...prev, name: '' })); }}
                            />
                            {fieldErrors.name && <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>}
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">{t('email')}</label>
                                <input
                                    type="email"
                                    required
                                    className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none ${fieldErrors.email ? 'border-red-400' : 'border-gray-200'}`}
                                    placeholder={t('emailPlaceholder')}
                                    value={formData.email}
                                    onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setFieldErrors(prev => ({ ...prev, email: '' })); }}
                                />
                                {fieldErrors.email && <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">{t('phone')}</label>
                                <input
                                    type="tel"
                                    required
                                    className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none ${fieldErrors.phone ? 'border-red-400' : 'border-gray-200'}`}
                                    placeholder={t('phonePlaceholder')}
                                    value={formData.phone}
                                    onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); setFieldErrors(prev => ({ ...prev, phone: '' })); }}
                                />
                                {fieldErrors.phone && <p className="mt-1 text-sm text-red-600">{fieldErrors.phone}</p>}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">{t('message')}</label>
                            <textarea
                                required
                                rows="4"
                                className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none ${fieldErrors.message ? 'border-red-400' : 'border-gray-200'}`}
                                placeholder={t('messagePlaceholder')}
                                value={formData.message}
                                onChange={(e) => { setFormData({ ...formData, message: e.target.value }); setFieldErrors(prev => ({ ...prev, message: '' })); }}
                            />
                            {fieldErrors.message && <p className="mt-1 text-sm text-red-600">{fieldErrors.message}</p>}
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-lg transition-all shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-5 h-5" />
                            {loading ? (t('sending') || 'Sending...') : (t('sendMessage') || 'Send Message')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
        </>
    );
};

export default ContactPage;