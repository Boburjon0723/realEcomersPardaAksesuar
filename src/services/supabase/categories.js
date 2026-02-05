import { supabase } from '../../supabaseClient';

const CATEGORIES_TABLE = 'categories';

// Get all categories
export const getAllCategories = async () => {
    try {
        const { data, error } = await supabase
            .from(CATEGORIES_TABLE)
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return { success: true, categories: data };
    } catch (error) {
        console.error('Error fetching categories:', error);
        return { success: false, error: error.message };
    }
};

// Add category
export const addCategory = async (categoryData) => {
    try {
        const { data, error } = await supabase
            .from(CATEGORIES_TABLE)
            .insert([categoryData])
            .select()
            .single();

        if (error) throw error;
        return { success: true, category: data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};
