import React, { useState } from 'react';

const ProductGallery = ({ images = [], productName }) => {
    const [mainImage, setMainImage] = useState(images.length > 0 ? images[0] : 'https://via.placeholder.com/600x400?text=No+Image');

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
        <div className="flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails (Vertical on desktop) */}
            <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto md:w-24 md:h-[600px] scrollbar-hide">
                {images.map((img, idx) => (
                    <img
                        key={idx}
                        src={img}
                        alt={`${productName} ${idx + 1}`}
                        onClick={() => setMainImage(img)}
                        className={`w-20 h-20 md:w-full md:h-24 object-cover rounded-lg cursor-pointer border-2 transition-all duration-300 ${mainImage === img
                            ? 'border-primary opacity-100'
                            : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                    />
                ))}
            </div>

            {/* Main Image */}
            <div className="flex-1 rounded-xl overflow-hidden bg-gray-50 relative aspect-[4/5] md:aspect-auto md:h-[600px]">
                <img
                    src={mainImage}
                    alt={productName}
                    className="w-full h-full object-cover"
                />
            </div>
        </div>
    );
};

export default ProductGallery;