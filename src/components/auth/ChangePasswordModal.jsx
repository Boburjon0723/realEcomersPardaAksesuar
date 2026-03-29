import React, { useState } from 'react';
import { X, Lock, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { updatePassword } from '../../services/supabase/auth';
import { clearPasswordRecoveryPending } from '../../supabaseClient';

const ChangePasswordModal = ({ variant = 'profile', onClose, onSuccess }) => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password.length < 6) {
            setError(t('passwordMinLength') || "Parol kamida 6 belgidan iborat bo'lishi kerak");
            return;
        }
        if (password !== confirmPassword) {
            setError(t('passwordMismatch'));
            return;
        }
        setLoading(true);
        try {
            const res = await updatePassword(password);
            if (res.success) {
                if (variant === 'recovery') {
                    clearPasswordRecoveryPending();
                    if (typeof window !== 'undefined' && window.history?.replaceState) {
                        const { pathname, search } = window.location;
                        window.history.replaceState(null, '', pathname + (search || ''));
                    }
                }
                onSuccess?.();
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-primary" />
                        {variant === 'recovery' ? t('recoveryNewPasswordTitle') : t('changePassword')}
                    </h3>
                    <button
                        type="button"
                        onClick={() => {
                            if (variant === 'recovery') clearPasswordRecoveryPending();
                            onClose();
                        }}
                        className="p-2 -m-2 rounded-full hover:bg-gray-100"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
                    {variant === 'recovery' && (
                        <p className="text-sm text-gray-600">{t('recoveryNewPasswordHint')}</p>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('newPassword')}</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-4 pr-12 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                placeholder={t('passwordPlaceholder')}
                                minLength={6}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-500 hover:text-primary hover:bg-gray-50 transition-colors"
                                aria-label={showPassword ? (t('hidePassword') || 'Parolni yashirish') : (t('showPassword') || 'Parolni ko‘rsatish')}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('confirmPassword')}</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-4 pr-12 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                placeholder={t('confirmPasswordPlaceholder')}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => setShowConfirmPassword((v) => !v)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-500 hover:text-primary hover:bg-gray-50 transition-colors"
                                aria-label={showConfirmPassword ? (t('hidePassword') || 'Parolni yashirish') : (t('showPassword') || 'Parolni ko‘rsatish')}
                            >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                if (variant === 'recovery') clearPasswordRecoveryPending();
                                onClose();
                            }}
                            className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50"
                        >
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

export default ChangePasswordModal;
