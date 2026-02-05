import React from 'react';
import { Send, Phone, Instagram } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

const FloatingContacts = () => {
    const { settings } = useApp();

    return (
        <div className="fixed bottom-8 right-8 flex flex-col space-y-4 z-40 group">
            {settings.telegram_url && (
                <a
                    href={settings.telegram_url}
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
                    href={settings.instagram_url}
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