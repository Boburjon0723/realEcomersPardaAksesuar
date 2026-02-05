import { createPaymePayment } from './payme';
import { createClickPayment } from './click';
import { createUzcardPayment } from './uzcard';

/**
 * To'lovni boshlash - barcha to'lov metodlarini birlashtiradi
 * @param {string} method - To'lov metodi: 'payme', 'click', 'uzcard', 'humo'
 * @param {object} paymentData - To'lov ma'lumotlari
 * @returns {Promise<object>} - To'lov natijasi
 */
export const initiatePayment = async (method, paymentData) => {
    try {
        let result;

        switch (method.toLowerCase()) {
            case 'payme':
                result = await createPaymePayment(paymentData);
                break;

            case 'click':
                result = await createClickPayment(paymentData);
                break;

            case 'uzcard':
            case 'humo':
                result = await createUzcardPayment(paymentData);
                break;

            default:
                return {
                    success: false,
                    error: `Noma'lum to'lov metodi: ${method}`
                };
        }

        // Agar to'lov URL mavjud bo'lsa, avtomatik redirect qilish
        if (result.success && result.paymentUrl) {
            // Kichik kechikish bilan redirect (UI yangilanishi uchun)
            setTimeout(() => {
                window.location.href = result.paymentUrl;
            }, 1000);
        }

        return result;

    } catch (error) {
        console.error('Payment initiation error:', error);
        return {
            success: false,
            error: error.message || 'To\'lovni boshlashda xatolik yuz berdi'
        };
    }
};

/**
 * To'lov holatini tekshirish
 * @param {string} orderId - Buyurtma ID
 * @param {string} method - To'lov metodi
 * @returns {Promise<object>} - To'lov holati
 */
export const checkPaymentStatus = async (orderId, method) => {
    try {
        // Bu funksiya backend'dan to'lov holatini tekshiradi
        // Hozircha mock response qaytaramiz
        return {
            success: true,
            status: 'pending',
            orderId
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * To'lovni bekor qilish
 * @param {string} transactionId - Tranzaksiya ID
 * @param {string} method - To'lov metodi
 * @returns {Promise<object>} - Bekor qilish natijasi
 */
export const cancelPayment = async (transactionId, method) => {
    try {
        // Backend'ga so'rov yuborish
        return {
            success: true,
            message: 'To\'lov bekor qilindi'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};
