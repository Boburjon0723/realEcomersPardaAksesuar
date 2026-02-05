import React, { useState, useEffect } from 'react';
import { getAllProducts, addProduct, updateProduct, deleteProduct } from '../firebase/products';
import { onAuthChange, loginUser, logoutUser } from '../firebase/auth';

/**
 * Example component demonstrating Firebase integration
 * This shows how to use Firebase services in your components
 */
const FirebaseExample = () => {
    const [products, setProducts] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Monitor authentication state
    useEffect(() => {
        const unsubscribe = onAuthChange((currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Load products
    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        const result = await getAllProducts();
        if (result.success) {
            setProducts(result.products);
        } else {
            console.error('Error loading products:', result.error);
        }
    };

    const handleLogin = async (email, password) => {
        const result = await loginUser(email, password);
        if (result.success) {
            console.log('Login successful:', result.user);
        } else {
            console.error('Login error:', result.error);
        }
    };

    const handleLogout = async () => {
        const result = await logoutUser();
        if (result.success) {
            console.log('Logout successful');
        }
    };

    const handleAddProduct = async (productData, imageFile) => {
        const result = await addProduct(productData, imageFile);
        if (result.success) {
            console.log('Product added:', result.productId);
            loadProducts(); // Reload products
        } else {
            console.error('Error adding product:', result.error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Firebase Integration Example</h1>

            {/* Auth Status */}
            <div>
                {user ? (
                    <div>
                        <p>Logged in as: {user.email}</p>
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                ) : (
                    <p>Not logged in</p>
                )}
            </div>

            {/* Products List */}
            <div>
                <h2>Products ({products.length})</h2>
                <ul>
                    {products.map(product => (
                        <li key={product.id}>
                            {product.name} - ${product.price}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default FirebaseExample;
