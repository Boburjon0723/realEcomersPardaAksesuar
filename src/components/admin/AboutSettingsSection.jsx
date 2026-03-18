/**
 * About sahifasi header rasmini boshqarish
 * CRM Web sayt sozlamalari sahifasida ishlatiladi
 */
import React, { useState, useEffect } from 'react';
import { getSettings, updateSettings, uploadAboutHeroImage } from '../../services/supabase/settings';

const LABELS = {
    uz: {
        title: "About sahifasi - Header rasm",
        currentImage: "Hozirgi rasm",
        uploadNew: "Yangi rasm yuklash",
        orUrl: "yoki URL kiriting",
        save: "Saqlash",
        success: "Rasm muvaffaqiyatli yangilandi",
        error: "Xatolik",
        loading: "Yuklanmoqda...",
        uploadBtn: "Rasm tanlash",
    },
    ru: {
        title: "Страница About - Изображение заголовка",
        currentImage: "Текущее изображение",
        uploadNew: "Загрузить новое изображение",
        orUrl: "или введите URL",
        save: "Сохранить",
        success: "Изображение успешно обновлено",
        error: "Ошибка",
        loading: "Загрузка...",
        uploadBtn: "Выбрать изображение",
    },
    en: {
        title: "About page - Header image",
        currentImage: "Current image",
        uploadNew: "Upload new image",
        orUrl: "or enter URL",
        save: "Save",
        success: "Image updated successfully",
        error: "Error",
        loading: "Loading...",
        uploadBtn: "Choose image",
    },
};

export default function AboutSettingsSection({ lang = 'uz', onSuccess }) {
    const [settings, setSettings] = useState(null);
    const [aboutHeroImage, setAboutHeroImage] = useState('');
    const [urlInput, setUrlInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const t = LABELS[lang] || LABELS.uz;

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const res = await getSettings();
            if (res.success && res.settings) {
                setSettings(res.settings);
                setAboutHeroImage(res.settings.about_hero_image || '');
                setUrlInput(res.settings.about_hero_image || '');
            }
            setLoading(false);
        };
        load();
    }, []);

    const handleFileChange = async (e) => {
        const file = e.target?.files?.[0];
        if (!file || !settings?.id) return;
        if (!file.type.startsWith('image/')) {
            setError('Faqat rasm fayllari (jpg, png, webp) qabul qilinadi');
            return;
        }
        setError('');
        setSaving(true);
        const res = await uploadAboutHeroImage(file);
        if (res.success) {
            setAboutHeroImage(res.url);
            setUrlInput(res.url);
            const upd = await updateSettings(settings.id, { about_hero_image: res.url });
            if (upd.success) {
                setSuccess(t.success);
                setTimeout(() => setSuccess(''), 3000);
                onSuccess?.();
            } else setError(upd.error || t.error);
        } else setError(res.error || t.error);
        setSaving(false);
    };

    const handleSaveUrl = async () => {
        const url = urlInput?.trim();
        if (!url || !settings?.id) return;
        setError('');
        setSaving(true);
        const res = await updateSettings(settings.id, { about_hero_image: url });
        if (res.success) {
            setAboutHeroImage(url);
            setSuccess(t.success);
            setTimeout(() => setSuccess(''), 3000);
            onSuccess?.();
        } else setError(res.error || t.error);
        setSaving(false);
    };

    if (loading || !settings) {
        return <div className="p-6 text-gray-500">{t.loading}</div>;
    }

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{t.title}</h3>
            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
            {success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">{success}</div>}

            <div className="grid md:grid-cols-2 gap-6">
                {/* Hozirgi rasm preview */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.currentImage}</label>
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        {aboutHeroImage ? (
                            <img src={aboutHeroImage} alt="About hero" className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://via.placeholder.com/800x450?text=No+Image'; }} />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Rasm tanlanmagan</div>
                        )}
                    </div>
                </div>

                {/* Yangilash */
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t.uploadNew}</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={saving}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white file:font-medium hover:file:bg-primary/90"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t.orUrl}</label>
                        <div className="flex gap-2">
                            <input
                                type="url"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                placeholder="https://..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                            <button
                                onClick={handleSaveUrl}
                                disabled={saving}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium disabled:opacity-50"
                            >
                                {t.save}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
