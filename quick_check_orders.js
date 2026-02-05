const { createClient } = require('@supabase/supabase-js');

// Hardcode values for testing
const supabaseUrl = 'https://dvjggqffiyzzwtjwuvpgsupabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2amdncWZmaXl6end0and1dnAiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczODUwNjUwOCwiZXhwIjoyMDU0MDgyNTA4fQ.SXJ2a7pBH7i6VBmcKp3HRsFtwx5-MMRgvUkL4wBb2xg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrders() {
    console.log('Fetching latest 3 orders from "orders" table...\n');

    const { data, error } = await supabase
        .from('orders')
        .select('id, customer_name, total, receipt_url, payment_method_detail, source, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${data.length} orders:\n`);

    data.forEach((order, i) => {
        console.log(`${i + 1}. ${order.customer_name} - $${order.total}`);
        console.log(`   Order ID: ${order.id}`);
        console.log(`   Source: ${order.source || 'N/A'}`);
        console.log(`   Payment Method: ${order.payment_method_detail || 'N/A'}`);
        console.log(`   Receipt URL: ${order.receipt_url ? '✅ ' + order.receipt_url.substring(0, 50) + '...' : '❌ NOT SET'}`);
        console.log(`   Created: ${order.created_at}`);
        console.log('');
    });
}

checkOrders();
