import React, { useState } from 'react';
import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import ProductQuickView from './ProductQuickView';

const ProductGrid = ({ products, loading = false }) => {
    const [quickViewProduct, setQuickViewProduct] = useState(null);

    if (loading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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