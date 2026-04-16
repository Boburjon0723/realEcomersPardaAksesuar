import { supabase } from '../../supabaseClient';
import { canAccessEcommerce, resolveUserRole } from '../../utils/authRole';

/** Prod uchun Vercel/https domeni; bo‘lmasa joriy origin (Supabase Redirect URL bilan mos qo‘ying) */
export function getPasswordResetRedirectUrl() {
    const raw = typeof process !== 'undefined' ? process.env.REACT_APP_SITE_URL : undefined;
    const trimmed = raw != null ? String(raw).trim() : '';
    if (trimmed && /^https?:\/\//i.test(trimmed)) {
        return `${trimmed.replace(/\/$/, '')}/`;
    }
    if (typeof window !== 'undefined' && window.location?.origin) {
        return `${window.location.origin}/`;
    }
    return undefined;
}

/**
 * Ro‘yxatdan o‘tish: email + parol + metadata (ism, telefon, mamlakat).
 * Muvaffaqiyat: `{ success: true, user }` — `user` JWT foydalanuvchi (email tasdiq yoqilgan bo‘lsa `user` null bo‘lishi mumkin).
 * Xatolar: `User already registered`, `Password should be at least 6 characters`, va hok.
 */
export const registerUser = async (password, displayName, phone, country, email) => {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: displayName,
                    name: displayName,
                    phone: phone,
                    country: country,
                    email: email,
                    nuur_role: 'user',
                }
            }
        });
        if (error) throw error;

        // CRM integratsiyasi: Customers jadvaliga qo'shish
        if (data.user) {
            const { error: customerError } = await supabase
                .from('customers')
                .insert([
                    {
                        id: data.user.id,
                        name: displayName,
                        phone: phone,
                        email: email,
                        country: country,
                        created_at: new Date()
                    }
                ]);

            if (customerError) {
                console.warn('Customer creation failed with ID, trying without ID', customerError);
                await supabase.from('customers').insert([
                    {
                        name: displayName,
                        phone: phone,
                        email: email,
                        country: country
                    }
                ]);
            }
        }

        return { success: true, user: data.user };
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Kirish: faqat email + parol (Supabase `signInWithPassword`).
 * Xatolar (message qisqacha):
 * - `Invalid login credentials` — noto‘g‘ri email/parol yoki foydalanuvchi yo‘q
 * - `Email not confirmed` — email tasdiqlanmagan (Dashboard sozlamasi)
 * - `400` / validation — noto‘g‘ri email format
 */
export const loginUser = async (email, password) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        const role = await resolveUserRole(data.user);
        if (!canAccessEcommerce(role)) {
            await supabase.auth.signOut();
            return { success: false, error: "Bu akkaunt faqat ichki bo'limlar uchun. E-commercega user roli kerak." };
        }
        return { success: true, user: data.user, role };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Logout user
export const logoutUser = async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

/**
 * Parolni tiklash — emailga havola yuboriladi.
 * Supabase Dashboard → Authentication → URL configuration:
 * Site URL va Redirect URLs da domeningiz (masalan https://sizning-domen.uz) bo'lishi kerak.
 */
export const resetPassword = async (email, options = {}) => {
    try {
        const redirectTo = options.redirectTo || getPasswordResetRedirectUrl();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo,
        });
        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Profil ma'lumotlarini yangilash (ism, telefon)
export const updateUserProfile = async (name, phone) => {
    try {
        const { data, error } = await supabase.auth.updateUser({
            data: {
                display_name: name,
                name,
                phone
            }
        });
        if (error) throw error;
        return { success: true, user: data.user };
    } catch (error) {
        console.error('Update profile error:', error);
        return { success: false, error: error.message };
    }
};

// Parolni o'zgartirish (kirish qilingan foydalanuvchi uchun)
export const updatePassword = async (newPassword) => {
    try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Update password error:', error);
        return { success: false, error: error.message };
    }
};

// Auth state observer
export const onAuthChange = (callback) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        callback(session?.user || null);
    });
    return () => subscription.unsubscribe();
};
