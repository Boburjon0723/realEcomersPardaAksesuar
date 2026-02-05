import { db } from './config';
import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy
} from 'firebase/firestore';

const ORDERS_COLLECTION = 'orders';

// Create new order
export const createOrder = async (orderData) => {
    try {
        const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
            ...orderData,
            status: 'pending',
            createdAt: new Date().toISOString()
        });

        return { success: true, orderId: docRef.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Get all orders
export const getAllOrders = async () => {
    try {
        const q = query(
            collection(db, ORDERS_COLLECTION),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const orders = [];
        querySnapshot.forEach((doc) => {
            orders.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, orders };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Get order by ID
export const getOrderById = async (orderId) => {
    try {
        const docRef = doc(db, ORDERS_COLLECTION, orderId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { success: true, order: { id: docSnap.id, ...docSnap.data() } };
        } else {
            return { success: false, error: 'Order not found' };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Get orders by user ID
export const getOrdersByUserId = async (userId) => {
    try {
        const q = query(
            collection(db, ORDERS_COLLECTION),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const orders = [];
        querySnapshot.forEach((doc) => {
            orders.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, orders };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
    try {
        const docRef = doc(db, ORDERS_COLLECTION, orderId);
        await updateDoc(docRef, {
            status,
            updatedAt: new Date().toISOString()
        });

        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Update order
export const updateOrder = async (orderId, orderData) => {
    try {
        const docRef = doc(db, ORDERS_COLLECTION, orderId);
        await updateDoc(docRef, {
            ...orderData,
            updatedAt: new Date().toISOString()
        });

        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Delete order
export const deleteOrder = async (orderId) => {
    try {
        await deleteDoc(doc(db, ORDERS_COLLECTION, orderId));
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Get orders by status
export const getOrdersByStatus = async (status) => {
    try {
        const q = query(
            collection(db, ORDERS_COLLECTION),
            where('status', '==', status),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const orders = [];
        querySnapshot.forEach((doc) => {
            orders.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, orders };
    } catch (error) {
        return { success: false, error: error.message };
    }
};
