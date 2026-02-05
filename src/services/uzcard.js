export const uzcardConfig = {
    terminalId: process.env.REACT_APP_UZCARD_TERMINAL_ID,
    apiKey: process.env.REACT_APP_UZCARD_API_KEY,
    merchantName: 'TechGear',
    apiUrl: 'https://test.uzcard.uz/api', // Test URL
    prodUrl: 'https://api.uzcard.uz/api'
};

export const createUzcardPayment = async (orderData) => {
    try {
        const response = await fetch(`${uzcardConfig.apiUrl}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${uzcardConfig.apiKey}`
            },
            body: JSON.stringify({
                terminal_id: uzcardConfig.terminalId,
                amount: Math.round(orderData.amount * 100), // Tiyinga
                order_id: orderData.orderId,
                return_url: window.location.origin + '/payment/callback',
                description: `Buyurtma #${orderData.orderId}`,
                language: orderData.language || 'uz',
                currency: 'UZS'
            })
        });

        const data = await response.json();

        if (data.success) {
            return {
                success: true,
                paymentUrl: data.payment_url,
                transactionId: data.transaction_id,
                method: 'uzcard'
            };
        } else {
            return {
                success: false,
                error: data.message
            };
        }
    } catch (error) {
        console.error('Uzcard payment error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Uzcard webhook handler
// Note: This should be implemented on backend with proper signature verification
export const handleUzcardWebhook = async (request) => {
    try {
        const {
            transaction_id,
            order_id,
            status
        } = request;

        // Signature verification should be done on backend
        // Frontend can't securely use crypto module

        if (status === 'success') {
            // To'lov muvaffaqiyatli
            // await updateOrder(order_id, { 
            //   paymentStatus: 'paid', 
            //   transactionId: transaction_id
            // });

            return {
                success: true,
                message: 'Payment confirmed'
            };
        } else {
            // To'lov bekor qilindi
            return {
                success: false,
                error: 'Payment cancelled'
            };
        }
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};
