import React, { useState, useEffect, useRef } from 'react';
import { RotateCw, Move } from 'lucide-react';

const ThreeSixtyViewer = ({ images, productName }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const containerRef = useRef(null);

    // Filter out potential null or empty strings
    const validImages = images?.filter(img => img && typeof img === 'string') || [];

    const handleStart = (e) => {
        setIsDragging(true);
        setStartX(e.pageX || e.touches[0].pageX);
    };

    const handleMove = (e) => {
        if (!isDragging) return;

        const currentX = e.pageX || e.touches[0].pageX;
        const diff = startX - currentX;

        // sensitivity: every 10px of drag = 1 image frame change
        const sensitivity = 10;
        if (Math.abs(diff) > sensitivity) {
            const framesToMove = Math.floor(diff / sensitivity);
            let nextIndex = currentIndex + framesToMove;

            // Loop functionality
            if (nextIndex >= validImages.length) nextIndex = 0;
            if (nextIndex < 0) nextIndex = validImages.length - 1;

            setCurrentIndex(nextIndex);
            setStartX(currentX); // Reset startX to current to keep it smooth
        }
    };

    const handleEnd = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        const handleGlobalUp = () => setIsDragging(false);
        window.addEventListener('mouseup', handleGlobalUp);
        window.addEventListener('touchend', handleGlobalUp);
        return () => {
            window.removeEventListener('mouseup', handleGlobalUp);
            window.removeEventListener('touchend', handleGlobalUp);
        };
    }, []);

    if (validImages.length < 2) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-400 text-sm">360° ko'rinish uchun kamida 5-10 ta rasm yuklang</p>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full bg-white rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
        >
            {/* Main Image */}
            <div className="w-full h-full flex items-center justify-center p-4">
                <img
                    src={validImages[currentIndex]}
                    alt={`${productName} - 360 view frame ${currentIndex}`}
                    className="max-w-full max-h-full object-contain pointer-events-none"
                    draggable="false"
                />
            </div>

            {/* Overlay UI */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/10 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-3">
                <RotateCw className="w-4 h-4 text-gray-600 animate-spin-slow" />
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2">
                    <Move className="w-3 h-3" /> Aylantirish uchun suring
                </span>
                <span className="text-[10px] font-bold text-primary bg-white px-2 py-0.5 rounded-full shadow-sm">
                    {currentIndex + 1} / {validImages.length}
                </span>
            </div>

            {/* Hint for touch devices */}
            <div className="absolute top-4 left-4 bg-primary/10 text-primary p-2 rounded-lg">
                <RotateCw size={16} />
            </div>
        </div>
    );
};

export default ThreeSixtyViewer;
