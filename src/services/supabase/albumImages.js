import { supabase } from '../../supabaseClient';

const TABLE = 'album_images';

export const getAlbumImages = async () => {
    try {
        const { data, error } = await supabase
            .from(TABLE)
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

        if (error) throw error;
        return { success: true, images: data || [] };
    } catch (err) {
        console.error('getAlbumImages error:', err);
        return { success: false, images: [] };
    }
};
