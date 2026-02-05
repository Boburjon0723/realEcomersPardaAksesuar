import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './config';

const USERS_COLLECTION = 'users';

// Get all users
export const getAllUsers = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
        const users = [];
        querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, users };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Get user by ID
export const getUserById = async (userId) => {
    try {
        const docRef = doc(db, USERS_COLLECTION, userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { success: true, user: { id: docSnap.id, ...docSnap.data() } };
        } else {
            return { success: false, error: 'User not found' };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Update user role (e.g., make admin)
export const updateUserRole = async (userId, role) => {
    try {
        const docRef = doc(db, USERS_COLLECTION, userId);
        await updateDoc(docRef, {
            role,
            updatedAt: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};
