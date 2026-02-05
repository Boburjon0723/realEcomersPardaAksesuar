import { supabase } from '../../supabaseClient';

const USERS_TABLE = 'profiles'; // In Supabase, it's common to have a 'profiles' table for user data

// Get all users
export const getAllUsers = async () => {
    try {
        const { data, error } = await supabase
            .from(USERS_TABLE)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, users: data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Get user by ID
export const getUserById = async (userId) => {
    try {
        const { data, error } = await supabase
            .from(USERS_TABLE)
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return { success: true, user: data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Update user role
export const updateUserRole = async (userId, role) => {
    try {
        const { error } = await supabase
            .from(USERS_TABLE)
            .update({ role })
            .eq('id', userId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};
