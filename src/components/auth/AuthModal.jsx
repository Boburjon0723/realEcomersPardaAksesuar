import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, ArrowRight, Phone } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { loginUser, registerUser } from '../../services/supabase/auth';

const AuthModal = () => {
    const { setShowAuth, isLogin, setIsLogin, setCurrentUser } = useApp();
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!isLogin && formData.password !== formData.confirmPassword) {
            setError(t('passwordMismatch'));
            setLoading(false);
            return;
        }

        try {
            let result;
            if (isLogin) {
                result = await loginUser(formData.email, formData.password);
            } else {
                result = await registerUser(formData.email, formData.password, formData.name, formData.phone);
            }

            if (result.success) {
                // Determine user object to save (use returned user or construct one)
                const user = result.user || { email: formData.email, name: formData.name };
                // Add extra fields if needed for local state immediately
                if (!isLogin) {
                    user.name = formData.name;
                    user.phone = formData.phone;
                }

                setCurrentUser(user);
                localStorage.setItem('user', JSON.stringify(user));
                setShowAuth(false);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl scale-100 animate-scale-in">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-display font-bold text-gray-900">
                        {isLogin ? t('login') : t('register')}
                    </h2>
                    <button
                        onClick={() => setShowAuth(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-700">
                                {t('name')}
                            </label>
                            <div className="relative group">
                                <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-medium"
                                    placeholder={t('enterName')}
                                />
                            </div>
                        </div>
                    )}

                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-700">
                                {t('phone') || 'Telefon raqam'}
                            </label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-medium"
                                    placeholder="+998 90 123 45 67"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold mb-2 text-gray-700">
                            {t('email')}
                        </label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-medium"
                                placeholder="email@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="block text-sm font-bold text-gray-700">
                                {t('password')}
                            </label>
                            {isLogin && (
                                <button type="button" className="text-xs font-bold text-primary hover:underline">
                                    {t('forgotPassword')}
                                </button>
                            )}
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
                            <input
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-medium"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>


                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-700">
                                {t('confirmPassword')}
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
                                <input
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-lg transition-all shadow-lg hover:shadow-primary/30 font-bold text-lg flex items-center justify-center gap-2 group"
                    >
                        {isLogin ? t('login') : t('register')}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-gray-100 pt-6">
                    <p className="text-gray-500 mb-2">{isLogin ? "Don't have an account?" : "Already have an account?"}</p>
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-primary hover:text-primary-dark font-bold text-lg hover:underline transition-all"
                    >
                        {isLogin ? t('noAccount') || 'Create Account' : t('haveAccount') || 'Sign In'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;