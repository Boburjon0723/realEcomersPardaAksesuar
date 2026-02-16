import React, { useState } from 'react';
import { X, Lock, User as UserIcon, ArrowRight, Phone } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { loginUser, registerUser } from '../../services/supabase/auth';

const countries = [
    { id: 'uzbekistan', code: '+998', name: 'uzbekistan' },
    { id: 'kazakhstan', code: '+7', name: 'kazakhstan' },
    { id: 'kyrgyzstan', code: '+996', name: 'kyrgyzstan' },
    { id: 'tajikistan', code: '+992', name: 'tajikistan' },
    { id: 'turkmenistan', code: '+993', name: 'turkmenistan' },
    { id: 'turkey', code: '+90', name: 'turkey' },
    { id: 'uae', code: '+971', name: 'uae' },
    { id: 'saudi_arabia', code: '+966', name: 'saudi_arabia' },
    { id: 'qatar', code: '+974', name: 'qatar' },
    { id: 'kuwait', code: '+965', name: 'kuwait' },
    { id: 'oman', code: '+968', name: 'oman' },
    { id: 'azerbaijan', code: '+994', name: 'azerbaijan' },
    { id: 'russia', code: '+7', name: 'russia' },
    { id: 'china', code: '+86', name: 'china' },
    { id: 'afghanistan', code: '+93', name: 'afghanistan' },
    { id: 'armenia', code: '+374', name: 'armenia' },
    { id: 'belarus', code: '+375', name: 'belarus' },
    { id: 'georgia', code: '+995', name: 'georgia' },
    { id: 'india', code: '+91', name: 'india' },
    { id: 'iran', code: '+98', name: 'iran' },
    { id: 'iraq', code: '+964', name: 'iraq' },
    { id: 'israel', code: '+972', name: 'israel' },
    { id: 'jordan', code: '+962', name: 'jordan' },
    { id: 'lebanon', code: '+961', name: 'lebanon' },
    { id: 'mongolia', code: '+976', name: 'mongolia' },
    { id: 'pakistan', code: '+92', name: 'pakistan' },
    { id: 'palestine', code: '+970', name: 'palestine' },
    { id: 'syria', code: '+963', name: 'syria' },
    { id: 'yemen', code: '+967', name: 'yemen' },
    { id: 'south_korea', code: '+82', name: 'south_korea' },
    { id: 'japan', code: '+81', name: 'japan' },
    { id: 'vietnam', code: '+84', name: 'vietnam' },
    { id: 'thailand', code: '+66', name: 'thailand' },
    { id: 'malaysia', code: '+60', name: 'malaysia' },
    { id: 'singapore', code: '+65', name: 'singapore' },
    { id: 'indonesia', code: '+62', name: 'indonesia' },
    { id: 'uk', code: '+44', name: 'uk' },
    { id: 'germany', code: '+49', name: 'germany' },
    { id: 'france', code: '+33', name: 'france' },
    { id: 'italy', code: '+39', name: 'italy' },
    { id: 'spain', code: '+34', name: 'spain' },
    { id: 'netherlands', code: '+31', name: 'netherlands' },
    { id: 'switzerland', code: '+41', name: 'switzerland' },
    { id: 'poland', code: '+48', name: 'poland' },
    { id: 'ukraine', code: '+380', name: 'ukraine' },
    { id: 'bangladesh', code: '+880', name: 'bangladesh' },
    { id: 'philippines', code: '+63', name: 'philippines' },
];

const AuthModal = () => {
    const { setShowAuth, setCurrentUser } = useApp();
    const { t } = useLanguage();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        phoneCode: '+998',
        country: 'uzbekistan',
        password: '',
        confirmPassword: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!isLogin && formData.password !== formData.confirmPassword) {
            setError(t('passwordMismatch'));
            return;
        }

        setLoading(true);
        try {
            const fullPhone = formData.phoneCode + formData.phone.replace(/\D/g, '');
            let result;
            if (isLogin) {
                result = await loginUser(formData.email, formData.password);
            } else {
                result = await registerUser(formData.password, formData.name, fullPhone, formData.country, formData.email);
            }

            if (result.success) {
                // Determine user object to save (use returned user or construct one)
                const user = result.user || { name: formData.name, phone: formData.phone, email: formData.email };
                // Add extra fields if needed for local state immediately
                if (!isLogin) {
                    user.name = formData.name;
                    user.phone = formData.phone;
                    user.email = formData.email;
                }

                setCurrentUser(user);
                localStorage.setItem('user', JSON.stringify(user));
                setShowAuth(false);
            } else {
                if (result.error.includes('Email not confirmed')) {
                    setError(t('verifyError'));
                } else if (result.error.includes('Invalid login credentials')) {
                    setError(t('invalidCredentials'));
                } else {
                    setError(result.error);
                }
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

                    <div>
                        <label className="block text-sm font-bold mb-2 text-gray-700">
                            {t('email') || 'Email'}
                        </label>
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">@</span>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-medium"
                                placeholder="example@mail.com"
                            />
                        </div>
                    </div>

                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-700">
                                {t('phone') || 'Telefon raqam'}
                            </label>
                            <div className="flex gap-2">
                                <div className="relative min-w-[100px]">
                                    <select
                                        value={formData.phoneCode}
                                        onChange={(e) => {
                                            const country = countries.find(c => c.code === e.target.value);
                                            setFormData({
                                                ...formData,
                                                phoneCode: e.target.value,
                                                country: country ? country.id : formData.country
                                            });
                                        }}
                                        className="w-full pl-4 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-medium appearance-none"
                                    >
                                        {countries.map(c => (
                                            <option key={c.id} value={c.code}>{c.code}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <ArrowRight className="w-3 h-3 text-gray-400 rotate-90" />
                                    </div>
                                </div>
                                <div className="relative flex-1 group">
                                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-medium"
                                        placeholder="90 123 45 67"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-700">
                                {t('country')}
                            </label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
                                <select
                                    required
                                    value={formData.country}
                                    onChange={(e) => {
                                        const country = countries.find(c => c.id === e.target.value);
                                        setFormData({
                                            ...formData,
                                            country: e.target.value,
                                            phoneCode: country ? country.code : formData.phoneCode
                                        });
                                    }}
                                    className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-medium appearance-none"
                                >
                                    {countries.map(c => (
                                        <option key={c.id} value={c.id}>{t(c.name)}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <ArrowRight className="w-4 h-4 text-gray-400 rotate-90" />
                                </div>
                            </div>
                        </div>
                    )}

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
                        disabled={loading}
                        className={`w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-lg transition-all shadow-lg hover:shadow-primary/30 font-bold text-lg flex items-center justify-center gap-2 group ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (isLogin ? 'Kirish...' : 'Ro\'yxatdan o\'tish...') : (isLogin ? t('login') : t('register'))}
                        {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
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