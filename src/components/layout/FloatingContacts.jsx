import React from 'react';
import { Send, Phone, Instagram } from 'lucide-react';
import { useApp } from '../../hooks/useApp';
import { normalizeExternalUrl, normalizeTelegramUrl } from '../../utils/externalUrl';

const FloatingContacts = () => {
    const { settings } = useApp();

    return (
        <div
            className="fixed z-30 flex flex-col gap-3 bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-[calc(0.75rem+env(safe-area-inset-right,0px))] sm:bottom-6 sm:right-6 md:bottom-8 md:right-8"
            aria-label="Contact shortcuts"
        >
            {settings.telegram_url && (
                <a
                    href={normalizeTelegramUrl(settings.telegram_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-[#0088cc] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300"
                    title="Telegram"
                >
                    <Send className="w-5 h-5" />
                </a>
            )}

            {settings.phone && (
                <a
                    href={`tel:${settings.phone.replace(/\s/g, '')}`}
                    className="w-12 h-12 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300"
                    title="Phone"
                >
                    <Phone className="w-5 h-5" />
                </a>
            )}

            {settings.instagram_url && (
                <a
                    href={normalizeExternalUrl(settings.instagram_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300"
                    title="Instagram"
                >
                    <Instagram className="w-5 h-5" />
                </a>
            )}
        </div>
    );
};

export default FloatingContacts;