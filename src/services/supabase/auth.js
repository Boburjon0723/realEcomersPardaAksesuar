import { supabase } from '../../supabaseClient';

// Helper to create virtual email from phone
const createVirtualEmail = (phone) => {
    // Remove all non-numeric characters
    const cleanPhone = phone.replace(/\D/g, '');
    // Standardize: Add 'u' prefix and use .com to pass strict validators
    return `u${cleanPhone}@nuurhome.com`;
};

// Register new user
export const registerUser = async (password, displayName, phone, country) => {
    try {
        const email = createVirtualEmail(phone);
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: displayName,
                    name: displayName,
                    phone: phone,
                    country: country
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

// Login user
export const loginUser = async (phone, password) => {
    try {
        const email = createVirtualEmail(phone);
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        return { success: true, user: data.user };
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

// Reset password
export const resetPassword = async (email) => {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        return { success: true };
    } catch (error) {
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
