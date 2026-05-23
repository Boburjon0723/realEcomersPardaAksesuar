import React, { useState } from 'react';
import { getOptimizedImageUrl } from '../../utils/image';

const ProductGallery = ({ images = [], productName }) => {
    const [mainImage, setMainImage] = useState(images.length > 0 ? images[0] : 'https://placehold.co/600x400?text=No+Image');

    React.useEffect(() => {
        if (images && images.length > 0) {
            setMainImage(images[0]);
        }
    }, [images]);

    if (!images || images.length === 0) {
        return (
            <div className="w-full aspect-square bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                <span className="text-gray-400">No images available</span>
            </div>
        );
    }
    return (
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full max-w-full min-w-0 overflow-hidden">
            {/* Main Image */}
            <div className="flex-1 min-w-0 rounded-xl overflow-hidden bg-gray-50 relative aspect-[4/5] sm:aspect-square md:aspect-auto md:h-[600px] group/gallery order-1 md:order-2">
                <img
                    src={getOptimizedImageUrl(mainImage, 800)}
                    alt={productName}
                    loading="lazy"
                    className="w-full h-full object-cover transition-all duration-500"
                />
            </div>

            {/* Thumbnails */}
            <div className="order-2 md:order-1 flex md:flex-col gap-2 md:gap-4 overflow-x-auto md:overflow-y-auto md:w-24 md:h-[600px] scrollbar-hide w-full min-w-0 py-1 px-0.5 snap-x snap-mandatory md:snap-none shrink-0">
                {images.map((img, idx) => (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => setMainImage(img)}
                        className={`shrink-0 snap-start w-[4.5rem] h-[4.5rem] md:w-full md:h-24 rounded-lg overflow-hidden border-2 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${mainImage === img
                            ? 'border-primary ring-1 ring-primary/30 opacity-100'
                            : 'border-gray-200 opacity-70 hover:opacity-100'
                            }`}
                    >
                        <img
                            src={getOptimizedImageUrl(img, 150)}
                            alt={`${productName} ${idx + 1}`}
                            loading="lazy"
                            className="w-full h-full object-cover"
                        />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ProductGallery;