import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY (yoki NEXT_PUBLIC_*) o‘rnating.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('Checking products table schema...');

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching products:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('Columns found in first record:', Object.keys(data[0]));
        console.log('Sample data:', data[0]);
    } else {
        console.log('No products found, cannot infer columns from data.');
    }
}

checkSchema();
