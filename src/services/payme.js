export const paymeConfig = {
    merchantId: process.env.REACT_APP_PAYME_MERCHANT_ID,
    testMode: process.env.REACT_APP_PAYME_TEST_MODE === 'true',
    testUrl: 'https://checkout.test.paycom.uz',
    prodUrl: 'https://checkout.paycom.uz'
};

export const createPaymePayment = async (orderData) => {
    try {
        const params = {
            m: paymeConfig.merchantId,
            ac: {
                order_id: orderData.orderId
            },
            a: Math.round(orderData.amount * 100), // Tiyinga aylantirish
            c: window.location.origin + '/payment/callback',
            l: orderData.language || 'uz'
        };

        const base64Params = btoa(JSON.stringify(params));
        const baseUrl = paymeConfig.testMode ? paymeConfig.testUrl : paymeConfig.prodUrl;
        const paymentUrl = `${baseUrl}/${base64Params}`;

        return {
            success: true,
            paymentUrl,
            method: 'payme'
        };
    } catch (error) {
        console.error('Payme payment error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Payme webhook handler (Backend uchun - Firebase Functions)
// Note: This should be implemented on backend
export const handlePaymeWebhook = async (request) => {
    const { method, params } = request;

    try {
        switch (method) {
            case 'CheckPerformTransaction':
                return await checkPaymeTransaction(params);

            case 'CreateTransaction':
                return await createPaymeTransaction(params);

            case 'PerformTransaction':
                return await performPaymeTransaction(params);

            case 'CancelTransaction':
                return await cancelPaymeTransaction(params);

            case 'CheckTransaction':
                return await getPaymeTransaction(params);

            default:
                return {
                    error: {
                        code: -32601,
                        message: 'Method not found'
                    }
                };
        }
    } catch (error) {
        return {
            error: {
                code: -32400,
                message: error.message
            }
        };
    }
};

async function checkPaymeTransaction(params) {
    // Buyurtmani tekshirish
    // const orderId = params.account.order_id;
    // const order = await getOrderById(orderId);

    // Mock response
    return {
        result: {
            allow: true
        }
    };
}

async function createPaymeTransaction(params) {
    const transactionId = params.id;
    const time = params.time;

    // Transaction yaratish
    // await createTransaction({ transactionId, orderId, amount, time, state: 1 });

    return {
        result: {
            create_time: time,
            transaction: transactionId,
            state: 1
        }
    };
}

async function performPaymeTransaction(params) {
    const transactionId = params.id;

    // Transaction ni bajarish
    // await updateTransaction(transactionId, { state: 2, perform_time: Date.now() });

    return {
        result: {
            transaction: transactionId,
            perform_time: Date.now(),
            state: 2
        }
    };
}

async function cancelPaymeTransaction(params) {
    const transactionId = params.id;
    const reason = params.reason;

    // Transaction ni bekor qilish
    // await updateTransaction(transactionId, { state: -reason, cancel_time: Date.now() });

    return {
        result: {
            transaction: transactionId,
            cancel_time: Date.now(),
            state: -reason
        }
    };
}

async function getPaymeTransaction(params) {
    const transactionId = params.id;

    // Transaction ma'lumotlarini olish
    // const transaction = await getTransactionById(transactionId);

    return {
        result: {
            create_time: Date.now(),
            perform_time: 0,
            cancel_time: 0,
            transaction: transactionId,
            state: 1,
            reason: null
        }
    };
}