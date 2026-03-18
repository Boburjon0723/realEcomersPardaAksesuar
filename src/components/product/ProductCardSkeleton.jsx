import React from 'react';

/**
 * Skeleton loader for ProductCard - loading paytida ko'rsatiladi
 */
const ProductCardSkeleton = () => {
    return (
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-200 animate-pulse">
            {/* Image placeholder */}
            <div className="aspect-[4/5] bg-gray-200" />

            {/* Content placeholder */}
            <div className="p-4 sm:p-5 bg-gradient-to-br from-stone-100 via-stone-50 to-primary/10 border-t border-stone-200 space-y-3">
                <div className="h-3 w-20 bg-gray-200 rounded" />
                <div className="h-5 w-full bg-gray-200 rounded" />
                <div className="h-5 w-3/4 bg-gray-200 rounded" />
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gray-200" />
                    <div className="h-3 w-12 bg-gray-200 rounded" />
                </div>
                <div className="flex justify-between pt-2">
                    <div className="h-5 w-20 bg-gray-200 rounded" />
                    <div className="h-4 w-8 bg-gray-200 rounded" />
                </div>
            </div>
        </div>
    );
};

export default ProductCardSkeleton;
