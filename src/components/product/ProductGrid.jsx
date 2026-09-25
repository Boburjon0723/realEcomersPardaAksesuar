import React, { useState } from 'react';
import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import ProductQuickView from './ProductQuickView';

/** withSidebar: yonida kategoriya paneli bo‘lsa 4 ustun faqat xl dan (aks holda karta juda torayadi) */
const gridClass = (withSidebar) =>
    `grid grid-cols-2 sm:grid-cols-3 ${withSidebar ? 'xl:grid-cols-4' : 'lg:grid-cols-4'} gap-3 sm:gap-4 md:gap-6`;

const ProductGrid = ({ products, loading = false, withSidebar = false }) => {
    const [quickViewProduct, setQuickViewProduct] = useState(null);

    if (loading) {
        return (
            <div className={gridClass(withSidebar)}>
                {Array.from({ length: 8 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    return (
        <>
            <div className={gridClass(withSidebar)}>
                {products.map(product => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onQuickView={() => setQuickViewProduct(product)}
                    />
                ))}
            </div>
            {quickViewProduct && (
                <ProductQuickView
                    product={quickViewProduct}
                    onClose={() => setQuickViewProduct(null)}
                />
            )}
        </>
    );
};

export default ProductGrid;
