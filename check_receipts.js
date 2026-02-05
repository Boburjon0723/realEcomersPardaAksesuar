const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLatestOrder() {
    console.log('Checking latest order with receipt...\n');

    const { data: orders, error } = await supabase
        .from('orders')
        .select('id, customer_name, total, receipt_url, payment_method_detail, created_at, source')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Last 5 orders:\n');
    orders.forEach((order, index) => {
        console.log(`${index + 1}. Customer: ${order.customer_name}`);
        console.log(`   ID: ${order.id}`);
        console.log(`   Total: $${order.total}`);
        console.log(`   Source: ${order.source || 'N/A'}`);
        console.log(`   Receipt URL: ${order.receipt_url || '❌ NOT SET'}`);
        console.log(`   Payment Method: ${order.payment_method_detail || 'N/A'}`);
        console.log(`   Created: ${order.created_at}`);
        console.log('');
    });

    // Check storage bucket
    console.log('\n=== Checking receipts storage bucket ===\n');
    const { data: files, error: storageError } = await supabase.storage
        .from('receipts')
        .list('receipts', { limit: 10, sortBy: { column: 'created_at', order: 'desc' } });

    if (storageError) {
        console.error('❌ Storage Error:', storageError.message);
    } else if (files && files.length > 0) {
        console.log(`✅ Found ${files.length} files in receipts bucket:`);
        files.forEach(file => {
            console.log(`   - ${file.name} (${(file.metadata?.size || 0 / 1024).toFixed(2)} KB)`);
        });
    } else {
        console.log('❌ No files found in receipts bucket');
    }
}

checkLatestOrder();
