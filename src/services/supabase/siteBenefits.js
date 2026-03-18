import { supabase } from '../../supabaseClient';

const TABLE = 'site_benefits';

export const getSiteBenefits = async () => {
    try {
        const { data, error } = await supabase
            .from(TABLE)
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

        if (error) throw error;
        return { success: true, benefits: data || [] };
    } catch (err) {
        console.error('getSiteBenefits error:', err);
        return { success: false, benefits: [] };
    }
};
