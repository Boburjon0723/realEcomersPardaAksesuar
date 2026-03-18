import React, { createContext, useContext } from 'react';
import { translations } from '../utils/translations';
import { getAllColors } from '../services/supabase/products';

const LanguageContext = createContext();

// Build map: normalized color name -> { name_uz, name_ru, name_en }
const buildColorMap = (colors) => {
    const map = {};
    if (!colors) return map;
    const normalize = (s) => (s || '').toLowerCase().replace(/'/g, '').replace(/\s+/g, '');
    colors.forEach((c) => {
        const entry = { name_uz: c.name_uz || c.name, name_ru: c.name_ru || c.name, name_en: c.name_en || c.name };
        [c.name, c.name_uz, c.name_ru, c.name_en].filter(Boolean).forEach((n) => {
            const k = normalize(n);
            if (k) map[k] = entry;
        });
    });
    return map;
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = React.useState('ru');
    const [colorMap, setColorMap] = React.useState({});

    React.useEffect(() => {
        const savedLang = localStorage.getItem('language');
        if (savedLang) setLanguage(savedLang);
    }, []);

    React.useEffect(() => {
        getAllColors().then((res) => {
            if (res.success && res.colors) setColorMap(buildColorMap(res.colors));
        });
    }, []);

    const t = (key) => translations[language]?.[key] || key;

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
        const key = (color || '').toLowerCase().replace(/'/g, '').replace(/\s+/g, '');
        const dbColor = colorMap[key];
        if (dbColor) {
            const name = dbColor[`name_${language}`] || dbColor.name_uz || dbColor.name_ru || dbColor.name_en || color;
            if (name) return name;
        }
        const translated = t(key);
        return translated === key ? color : translated;
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, toggleLanguage, t, translateColor, refreshColors: () => getAllColors().then((res) => res.success && res.colors && setColorMap(buildColorMap(res.colors))) }}>
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