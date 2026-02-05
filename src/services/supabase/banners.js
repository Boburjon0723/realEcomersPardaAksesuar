import { supabase } from '../../supabaseClient';

const BANNERS_TABLE = 'banners';

// Get active banners
export const getActiveBanners = async () => {
    try {
        const { data, error } = await supabase
            .from(BANNERS_TABLE)
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, banners: data };
    } catch (error) {
        console.error('Error fetching banners:', error);
        return { success: false, error: error.message };
    }
};

// Add banner
export const addBanner = async (bannerData) => {
    try {
        const { data, error } = await supabase
            .from(BANNERS_TABLE)
            .insert([bannerData])
            .select()
            .single();

        if (error) throw error;
        return { success: true, banner: data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Update banner
export const updateBanner = async (id, bannerData) => {
    try {
        const { error } = await supabase
            .from(BANNERS_TABLE)
            .update(bannerData)
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Delete banner
export const deleteBanner = async (id) => {
    try {
        const { error } = await supabase
            .from(BANNERS_TABLE)
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};
