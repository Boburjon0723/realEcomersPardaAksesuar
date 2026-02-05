import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://daytgnbiijycmljkuyyt.supabase.co';
const supabaseKey = 'sb_publishable_Mc3DwJx9rnt0JvZ1HZDlBQ_wzad0erY';

if (!supabaseUrl || !supabaseKey) {
    console.error('Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('Checking products table schema...');

    // Try to insert a dummy record to see structure or just select
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
        // Try creating a record with potential columns to see if it fails?
        // Or just assume standard columns.
    }
}

checkSchema();
