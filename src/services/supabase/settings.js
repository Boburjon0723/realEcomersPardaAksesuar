import { supabase } from '../../supabaseClient';

const SETTINGS_TABLE = 'settings';

export const getSettings = async () => {
    try {
        const { data, error } = await supabase
            .from(SETTINGS_TABLE)
            .select('*')
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        return {
            success: true,
            settings: data || {
                site_name: 'TechGear',
                logo_url: '',
                banner_text: '',
                phone: '',
                address: '',
                work_hours: '',
                telegram_url: '',
                instagram_url: '',
                facebook_url: '',
                humo_card: '',
                uzcard_card: '',
                visa_card: ''
            }
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateSettings = async (id, settingsData) => {
    try {
        const { error } = await supabase
            .from(SETTINGS_TABLE)
            .update({
                ...settingsData
            })
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

const SETTINGS_BUCKET = 'settings';
const SETTINGS_STORAGE_PATH = 'about-hero';

/** Upload About page hero image to Supabase storage and return public URL */
export const uploadAboutHeroImage = async (file) => {
    try {
        const ext = file.name.split('.').pop() || 'jpg';
        const fileName = `settings/${SETTINGS_STORAGE_PATH}-${Date.now()}.${ext}`;

        // Avval settings bucket, keyin products bucket (fallback)
        const buckets = [SETTINGS_BUCKET, 'products'];
        for (const bucket of buckets) {
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(fileName, file, { upsert: true });

            if (!uploadError) {
                const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
                return { success: true, url: publicUrl };
            }
        }
        throw new Error('Storage upload failed');
    } catch (error) {
        console.error('Error uploading about hero image:', error);
        return { success: false, error: error.message };
    }
};
