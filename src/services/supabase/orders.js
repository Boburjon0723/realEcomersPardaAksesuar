import { supabase } from '../../supabaseClient';

const ORDERS_TABLE = 'orders';
const ORDER_ITEMS_TABLE = 'order_items';
const RECEIPTS_BUCKET = 'receipts';

function formatDbError(error) {
    if (error == null) return "Noma'lum xato";
    if (typeof error === 'string') return error;
    const msg = error.message || error.msg;
    const detail = error.details || error.detail;
    const hint = error.hint;
    const code = error.code;
    const parts = [msg, detail, hint, code].filter(Boolean);
    if (parts.length) return parts.join(' — ');
    try {
        return JSON.stringify(error);
    } catch {
        return String(error);
    }
}

/** CRMda yetkazildi / tugallandi — mijoz saytida ro‘yxatda ko‘rinmasin (bazadan o‘chirilmaydi). */
function isOrderHiddenFromCustomerList(status) {
    if (status == null || status === '') return false;
    const s = String(status).toLowerCase().trim();
    const hidden = new Set([
        'completed',
        'yakunlangan',
        'tugallandi',
        'tugallangan',
        'delivered',
        'yetkazildi',
    ]);
    return hidden.has(s);
}

// Create new order
export const createOrder = async (orderData) => {
    console.log('Creating order with data:', orderData);
    try {
        const userId = orderData.userId !== 'guest' ? orderData.userId : null;

        // Kirgan foydalanuvchi: customers qatori (FK) + ba'zi RLS lar user_id ni talab qiladi
        if (userId) {
            const { error: custErr } = await supabase.from('customers').upsert(
                {
                    id: userId,
                    name: orderData.customerInfo.name,
                    phone: orderData.customerInfo.phone,
                    email: orderData.customerInfo.email || null,
                    address: orderData.customerInfo.address || '',
                },
                { onConflict: 'id' }
            );
            if (custErr) throw custErr;
        }

        // 1. Insert into orders table
        const orderRecord = {
            customer_name: orderData.customerInfo.name,
            customer_phone: orderData.customerInfo.phone,
            customer_address: orderData.customerInfo.address || '',
            total: orderData.totalPrice,
            note: orderData.customerInfo.notes || '',
            status: 'new',
            payment_status: orderData.payment_status || 'unpaid',
            payment_method_detail: orderData.paymentMethodDetail || null,
            receipt_url: orderData.receiptUrl || null,
            source: orderData.source || 'website',
            customer_id: userId,
        };
        if (userId) {
            orderRecord.user_id = userId;
        }

        const { data: order, error: orderError } = await supabase
            .from(ORDERS_TABLE)
            .insert([orderRecord])
            .select()
            .single();

        if (orderError) throw orderError;

        // 2. Insert items into order_items table
        const orderItems = orderData.products.map((item) => ({
            order_id: order.id,
            product_id: item.id,
            product_name: typeof item.name === 'object' ? item.name.uz : item.name,
            quantity: item.quantity,
            price: item.price,
            subtotal: Number(item.price) * Number(item.quantity),
            color: item.color || null,
            size: item.size || null,
            image_url: item.image || null,
        }));

        const { error: itemsError } = await supabase
            .from(ORDER_ITEMS_TABLE)
            .insert(orderItems);

        if (itemsError) {
            await supabase.from(ORDERS_TABLE).delete().eq('id', order.id);
            throw itemsError;
        }

        return { success: true, orderId: order.id };
    } catch (error) {
        console.error('Error creating order:', error);
        return { success: false, error: formatDbError(error) };
    }
};

// Get all orders
export const getAllOrders = async () => {
    try {
        const { data, error } = await supabase
            .from(ORDERS_TABLE)
            .select(`
                *,
                items: ${ORDER_ITEMS_TABLE}(*, product: products(*))
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map to expected format
        const formattedData = data.map(order => ({
            ...order,
            customerName: order.customer_name,
            totalAmount: Number(order.total),
            createdAt: order.created_at,
            products: order.items?.map(item => ({
                ...item.product,
                name: item.product_name || item.product?.name,
                quantity: item.quantity,
                price: Number(item.price)
            })) || []
        }));

        return { success: true, orders: formattedData };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Get orders for a specific user
export const getUserOrders = async (userId) => {
    try {
        const { data, error } = await supabase
            .from(ORDERS_TABLE)
            .select(`
                *,
                items: ${ORDER_ITEMS_TABLE}(*)
            `)
            .eq('customer_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const visible = (data || []).filter((row) => {
            if (row.deleted_at != null) return false;
            return !isOrderHiddenFromCustomerList(row.status);
        });

        // Map to expected format
        const formattedData = visible.map((order) => ({
            ...order,
            customerName: order.customer_name,
            totalAmount: Number(order.total),
            createdAt: order.created_at,
            products: order.items?.map(item => ({
                ...item,
                name: item.product_name,
                price: Number(item.price),
                image: item.image_url
            })) || []
        }));

        return { success: true, orders: formattedData };
    } catch (error) {
        console.error('Error fetching user orders:', error);
        return { success: false, error: error.message };
    }
};

// Get order by ID
export const getOrderById = async (orderId) => {
    try {
        const { data, error } = await supabase
            .from(ORDERS_TABLE)
            .select(`
                *,
                items: ${ORDER_ITEMS_TABLE}(*, product: products(*))
            `)
            .eq('id', orderId)
            .single();

        if (error) throw error;

        return {
            success: true,
            order: {
                ...data,
                customerName: data.customer_name,
                totalAmount: Number(data.total),
                products: data.items?.map(item => ({
                    ...item.product,
                    name: item.product_name || item.product?.name,
                    quantity: item.quantity,
                    price: Number(item.price)
                })) || []
            }
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
    try {
        const { error } = await supabase
            .from(ORDERS_TABLE)
            .update({ status })
            .eq('id', orderId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Update order
export const updateOrder = async (orderId, orderData) => {
    try {
        const mappedData = {};
        if (orderData.customerInfo?.name) mappedData.customer_name = orderData.customerInfo.name;
        if (orderData.customerInfo?.phone) mappedData.customer_phone = orderData.customerInfo.phone;
        if (orderData.customerInfo?.address) mappedData.customer_address = orderData.customerInfo.address;
        if (orderData.totalPrice) mappedData.total = orderData.totalPrice;
        if (orderData.customerInfo?.notes) mappedData.note = orderData.customerInfo.notes;
        if (orderData.status) mappedData.status = orderData.status;
        if (orderData.paymentStatus) mappedData.payment_status = orderData.paymentStatus;

        const { error } = await supabase
            .from(ORDERS_TABLE)
            .update(mappedData)
            .eq('id', orderId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Delete order
export const deleteOrder = async (orderId) => {
    try {
        const { error } = await supabase
            .from(ORDERS_TABLE)
            .delete()
            .eq('id', orderId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Upload payment receipt
export const uploadReceipt = async (orderId, file) => {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${orderId}_${Date.now()}.${fileExt}`;
        const filePath = `receipts/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from(RECEIPTS_BUCKET)
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from(RECEIPTS_BUCKET)
            .getPublicUrl(filePath);

        // Update order with receipt URL
        const { error: updateError } = await supabase
            .from(ORDERS_TABLE)
            .update({ receipt_url: publicUrl })
            .eq('id', orderId);

        if (updateError) throw updateError;

        return { success: true, url: publicUrl };
    } catch (error) {
        console.error('Error uploading receipt:', error);
        return { success: false, error: error.message };
    }
};
