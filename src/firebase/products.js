import { db, storage } from './config';
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
    orderBy,
    limit
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const PRODUCTS_COLLECTION = 'products';

// Get all products
export const getAllProducts = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
        const products = [];
        querySnapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, products };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Get product by ID
export const getProductById = async (productId) => {
    try {
        const docRef = doc(db, PRODUCTS_COLLECTION, productId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { success: true, product: { id: docSnap.id, ...docSnap.data() } };
        } else {
            return { success: false, error: 'Product not found' };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Get products by category
export const getProductsByCategory = async (category) => {
    try {
        const q = query(
            collection(db, PRODUCTS_COLLECTION),
            where('category', '==', category)
        );
        const querySnapshot = await getDocs(q);
        const products = [];
        querySnapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, products };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Add new product
export const addProduct = async (productData, imageFile) => {
    try {
        let imageUrl = '';

        // Upload image if provided
        if (imageFile) {
            const imageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
            const snapshot = await uploadBytes(imageRef, imageFile);
            imageUrl = await getDownloadURL(snapshot.ref);
        }

        const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
            ...productData,
            image: imageUrl,
            createdAt: new Date().toISOString()
        });

        return { success: true, productId: docRef.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Update product
export const updateProduct = async (productId, productData, imageFile) => {
    try {
        const docRef = doc(db, PRODUCTS_COLLECTION, productId);
        let updateData = { ...productData };

        // Upload new image if provided
        if (imageFile) {
            const imageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
            const snapshot = await uploadBytes(imageRef, imageFile);
            updateData.image = await getDownloadURL(snapshot.ref);
        }

        await updateDoc(docRef, {
            ...updateData,
            updatedAt: new Date().toISOString()
        });

        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Delete product
export const deleteProduct = async (productId, imageUrl) => {
    try {
        // Delete product document
        await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));

        // Delete image from storage if exists
        if (imageUrl) {
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef).catch(() => {
                // Ignore error if image doesn't exist
            });
        }

        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Search products
export const searchProducts = async (searchTerm) => {
    try {
        const querySnapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
        const products = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                data.description.toLowerCase().includes(searchTerm.toLowerCase())) {
                products.push({ id: doc.id, ...data });
            }
        });
        return { success: true, products };
    } catch (error) {
        return { success: false, error: error.message };
    }
};
