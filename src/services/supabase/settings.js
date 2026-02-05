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
