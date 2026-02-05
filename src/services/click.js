export const clickConfig = {
    merchantId: process.env.REACT_APP_CLICK_MERCHANT_ID,
    serviceId: process.env.REACT_APP_CLICK_SERVICE_ID,
    secretKey: process.env.REACT_APP_CLICK_SECRET_KEY,
    url: 'https://my.click.uz/services/pay'
};

export const createClickPayment = async (orderData) => {
    try {
        const params = new URLSearchParams({
            merchant_id: clickConfig.merchantId,
            service_id: clickConfig.serviceId,
            transaction_param: orderData.orderId,
            amount: orderData.amount,
            return_url: window.location.origin + '/payment/callback',
            merchant_user_id: orderData.userId || '0'
        });

        const paymentUrl = `${clickConfig.url}?${params.toString()}`;

        return {
            success: true,
            paymentUrl,
            method: 'click'
        };
    } catch (error) {
        console.error('Click payment error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Click webhook handler
// Note: This should be implemented on backend with proper signature verification
export const handleClickWebhook = async (request) => {
    const {
        click_trans_id,
        merchant_trans_id,
        action
    } = request;

    try {
        // Signature verification should be done on backend
        // Frontend can't securely use crypto module

        if (action === 0) {
            // Prepare - to'lovni tayyorlash
            return await prepareClickPayment(request);
        } else if (action === 1) {
            // Complete - to'lovni tasdiqlash
            return await completeClickPayment(request);
        }
    } catch (error) {
        return {
            error: -9,
            error_note: error.message
        };
    }
};

async function prepareClickPayment(request) {
    const orderId = request.merchant_trans_id;

    // Buyurtmani tekshirish
    // const order = await getOrderById(orderId);

    return {
        click_trans_id: request.click_trans_id,
        merchant_trans_id: orderId,
        merchant_prepare_id: Date.now(),
        error: 0,
        error_note: 'Success'
    };
}

async function completeClickPayment(request) {
    const orderId = request.merchant_trans_id;
    const clickTransId = request.click_trans_id;

    // To'lovni tasdiqlash
    // await updateOrder(orderId, { paymentStatus: 'paid', clickTransId });

    return {
        click_trans_id: clickTransId,
        merchant_trans_id: orderId,
        merchant_confirm_id: Date.now(),
        error: 0,
        error_note: 'Success'
    };
}