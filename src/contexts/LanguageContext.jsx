import React, { createContext, useContext } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    // Default to 'ru' if no saved preference
    const [language, setLanguage] = React.useState('ru');

    React.useEffect(() => {
        const savedLang = localStorage.getItem('language');
        if (savedLang) {
            setLanguage(savedLang);
        }
    }, []);

    const t = (key) => {
        return translations[language]?.[key] || key;
    };

    const changeLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };

    const toggleLanguage = () => {
        const langs = ['uz', 'ru', 'en'];
        const nextIndex = (langs.indexOf(language) + 1) % langs.length;
        changeLanguage(langs[nextIndex]);
    };

    const translateColor = (color) => {
        if (!color) return '';
        // Normalize: lowercase, remove apostrophes, remove spaces
        const key = color.toLowerCase().replace(/'/g, '').replace(/\s+/g, '');
        const translated = t(key);
        return translated === key ? color : translated;
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, toggleLanguage, t, translateColor }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};