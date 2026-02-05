import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import { createContactMessage } from '../services/supabase/messages';

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
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

                    {/* Simple Map Visualization or Placeholder */}
                    <div className="bg-gray-100 rounded-2xl overflow-hidden h-80 relative group">
                        <img
                            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                            alt="Map Location"
                            className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 transition-all duration-500"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary" />
                                <span className="font-bold text-gray-900">Showroom Location</span>
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
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                placeholder="Your Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">{t('email')}</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                    placeholder="email@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">{t('phone')}</label>
                                <input
                                    type="tel"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                    placeholder="+998..."
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">{t('message')}</label>
                            <textarea
                                required
                                rows="4"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none"
                                placeholder="How can we help you?"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            />
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
    );
};

export default ContactPage;