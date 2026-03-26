import React, { useState } from 'react';
import { X, User } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { updateUserProfile } from '../../services/supabase/auth';

const EditProfileModal = ({ user, onClose, onSuccess }) => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [name, setName] = useState(user?.name || user?.display_name || user?.user_metadata?.name || '');
    const [phone, setPhone] = useState(user?.phone || user?.user_metadata?.phone || '');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await updateUserProfile(name.trim(), phone.trim());
            if (res.success) {
                onSuccess?.(res.user);
                onClose();
            } else {
                setError(res.error || t('saveError'));
            }
        } catch (err) {
            setError(err?.message || t('saveError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        {t('editProfile') || "Profilni tahrirlash"}
                    </h3>
                    <button onClick={onClose} className="p-2 -m-2 rounded-full hover:bg-gray-100">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('name')}</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            placeholder={t('enterName')}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('phone')}</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            placeholder="+998 90 123 45 67"
                        />
                    </div>
                    <p className="text-xs text-gray-500">Email o'zgartirish uchun support bilan bog'laning.</p>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50">
                            {t('cancel')}
                        </button>
                        <button type="submit" disabled={loading} className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 disabled:opacity-70">
                            {loading ? t('saving') : t('save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
