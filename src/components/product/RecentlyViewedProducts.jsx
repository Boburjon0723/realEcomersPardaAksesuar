import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getAllProducts } from '../../services/supabase/products';
import ProductGrid from './ProductGrid';

const RecentlyViewedProducts = () => {
    const { recentlyViewed } = useApp();
    const { t } = useLanguage();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!recentlyViewed || recentlyViewed.length === 0) {
            setProducts([]);
            return;
        }

        const fetchProducts = async () => {
            setLoading(true);
            const result = await getAllProducts(true);
            if (result.success && result.products) {
                const ordered = recentlyViewed
                    .map(id => result.products.find(p => p.id === id))
                    .filter(Boolean);
                setProducts(ordered);
            } else {
                setProducts([]);
            }
            setLoading(false);
        };

        fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recentlyViewed?.length]);

    if (!recentlyViewed || recentlyViewed.length === 0 || products.length === 0) return null;

    return (
        <section className="mb-16">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
                {t('recentlyViewed')}
            </h2>
            {loading ? (
                <ProductGrid products={[]} loading={true} />
            ) : (
                <ProductGrid products={products} />
            )}
        </section>
    );
};

export default RecentlyViewedProducts;
