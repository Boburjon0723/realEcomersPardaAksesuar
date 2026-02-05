import { supabase } from '../../supabaseClient';

// Register new user
export const registerUser = async (email, password, displayName, phone) => {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: displayName,
                    phone: phone
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
                        id: data.user.id, // Trying to link with auth ID
                        name: displayName,
                        email: email,
                        phone: phone,
                        created_at: new Date()
                    }
                ]);

            // Agar id constraint bo'lsa yoki customers jadvali auth.users ga bog'lanmagan bo'lsa,
            // shunchaki id ni tashlab yuboramiz (serial bo'lishi mumkin)
            if (customerError) {
                console.warn('Customer creation failed with ID, trying without ID', customerError);
                await supabase.from('customers').insert([
                    {
                        name: displayName,
                        email: email,
                        phone: phone
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
export const loginUser = async (email, password) => {
    try {
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
