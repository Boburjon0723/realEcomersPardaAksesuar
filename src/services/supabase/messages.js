import { supabase } from '../../supabaseClient';

// Create a new contact message
export const createContactMessage = async (messageData) => {
    try {
        const { name, email, phone, subject, message } = messageData;

        // Validate required fields
        if (!name || !email || !message) {
            return {
                success: false,
                error: 'Name, email, and message are required'
            };
        }

        const { data, error } = await supabase
            .from('contact_messages')
            .insert([
                {
                    name,
                    email,
                    phone: phone || null,
                    subject: subject || null,
                    message,
                    status: 'new',
                    created_at: new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (error) throw error;

        return {
            success: true,
            data
        };
    } catch (error) {
        console.error('Error creating contact message:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Get all contact messages (for CRM)
export const getContactMessages = async (status = null) => {
    try {
        let query = supabase
            .from('contact_messages')
            .select('*')
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) throw error;

        return {
            success: true,
            data: data || []
        };
    } catch (error) {
        console.error('Error fetching contact messages:', error);
        return {
            success: false,
            error: error.message,
            data: []
        };
    }
};

// Update message status
export const updateMessageStatus = async (messageId, status, timestamp = null) => {
    try {
        const updateData = { status };

        if (status === 'read' && !timestamp) {
            updateData.read_at = new Date().toISOString();
        } else if (status === 'replied' && !timestamp) {
            updateData.replied_at = new Date().toISOString();
        }

        const { error } = await supabase
            .from('contact_messages')
            .update(updateData)
            .eq('id', messageId);

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Error updating message status:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Delete a contact message
export const deleteContactMessage = async (messageId) => {
    try {
        const { error } = await supabase
            .from('contact_messages')
            .delete()
            .eq('id', messageId);

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Error deleting contact message:', error);
        return {
            success: false,
            error: error.message
        };
    }
};
