import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import PageMeta from '../components/common/PageMeta';
import { getAlbumImages } from '../services/supabase/albumImages';
import { ArrowRight, Images, X } from 'lucide-react';

const AlbumPage = () => {
    const { setCurrentPage, settings } = useApp();
    const { language, t } = useLanguage();
    const [albumImages, setAlbumImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const res = await getAlbumImages();
            if (res.success) setAlbumImages(res.images || []);
            setLoading(false);
        };
        fetchData();
    }, []);

    return (
        <>
            <PageMeta
                title={t('album') || "Modellar albomi"}
                description={t('albumMetaDesc') || "Barcha mahsulot modellari - vizual katalog"}
                siteName={settings?.site_name}
            />
            <div className={`min-h-screen bg-gray-50 pb-16 transition-all duration-300 ${selectedImage ? 'pr-0 sm:pr-[32rem] md:pr-[36rem] lg:pr-[42rem]' : ''}`}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pt-6 sm:pt-8">
                    {/* Header */}
                    <div className="mb-10">
                        <span className="inline-block text-primary font-bold tracking-[0.2em] uppercase text-xs mb-2">
                            {t('album') || "Modellar albomi"}
                        </span>
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 tracking-tight mb-2">
                            {t('album') || "Modellar albomi"}
                        </h1>
                        <p className="text-gray-500 max-w-2xl text-base">
                            {t('albumDesc') || "CRM orqali yuklangan rasmlar galereyasi. Rasmni bosib to'liq ko'ring."}
                        </p>
                    </div>

                    {loading ? (
                        <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="break-inside-avoid mb-4 rounded-2xl bg-gray-200 animate-pulse"
                                    style={{ height: 180 + Math.random() * 120 }}
                                />
                            ))}
                        </div>
                    ) : albumImages.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <Images className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg mb-4">
                                {language === 'uz' ? "Albomda rasmlar hali yo'q. CRM orqali rasmlar qo'shing." : language === 'ru' ? 'В альбоме пока нет изображений. Добавьте их через CRM.' : 'No images in album yet. Add them via CRM.'}
                            </p>
                            <button
                                onClick={() => setCurrentPage('shop')}
                                className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 inline-flex items-center gap-2"
                            >
                                {t('shopNow')}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        /* Masonry bento - format bo'yicha o'lcham va ustun span */
                        <div
                            className="columns-2 sm:columns-3 lg:columns-4 gap-3 sm:gap-4"
                            style={{ columnGap: 'clamp(0.75rem, 2vw, 1rem)' }}
                        >
                            {albumImages.map((img) => {
                                const title = img[`title_${language}`] || img.title_uz || img.title_ru || img.title_en || '';
                                const format = img.format || 'portrait';
                                const aspectClass = format === 'square' ? 'aspect-square' : format === 'landscape' ? 'aspect-[3/2]' : format === 'large' ? 'aspect-[3/2] sm:aspect-[16/9]' : 'aspect-[4/5]';
                                const spanClass = format === 'large' ? 'column-span-2 break-inside-avoid' : 'break-inside-avoid';
                                return (
                                    <div
                                        key={img.id}
                                        className={`${spanClass} mb-3 sm:mb-4 group cursor-pointer`}
                                        onClick={() => setSelectedImage(img)}
                                    >
                                        <div className={`rounded-xl sm:rounded-2xl overflow-hidden bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_50px_rgba(5,77,59,0.18)] transition-all duration-300 border active:scale-[0.98] sm:hover:-translate-y-1 ${selectedImage?.id === img.id ? 'border-2 border-primary ring-2 ring-primary/30 shadow-lg' : 'border-gray-100 hover:border-primary/30'}`}>
                                            <div className={`relative ${aspectClass} overflow-hidden bg-gray-50`}>
                                                <img
                                                    src={img.image_url}
                                                    alt={title || 'Album'}
                                                    loading="lazy"
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/400x500?text=No+Image';
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                                    <span className="inline-flex items-center gap-1.5 text-white text-xs sm:text-sm font-bold">
                                                        {t('viewImage') || "Rasmini ko'rish"}
                                                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                    </span>
                                                </div>
                                            </div>
                                            {title && (
                                                <div className="p-3 sm:p-4">
                                                    <h3 className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-2">
                                                        {title}
                                                    </h3>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* O'ng tomondan ochiladigan rasm paneli — chap galereya scroll va bosish uchun ochiq */}
            {selectedImage && (
                <>
                    <div
                        className="fixed inset-0 bg-black/30 z-40 animate-fade-in pointer-events-none"
                        aria-hidden="true"
                    />
                    <div className="fixed inset-y-0 right-0 w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-white z-50 shadow-2xl flex flex-col animate-slide-in-right">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
                            <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate pr-2">
                                {selectedImage[`title_${language}`] || selectedImage.title_uz || selectedImage.title_ru || selectedImage.title_en || ''}
                            </h3>
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                aria-label="Yopish"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-4 flex items-center justify-center min-h-0">
                            <img
                                src={selectedImage.image_url}
                                alt={selectedImage[`title_${language}`] || selectedImage.title_uz || selectedImage.title_ru || selectedImage.title_en || 'Album'}
                                className="max-w-full max-h-full w-auto h-auto object-contain"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/400x500?text=No+Image';
                                }}
                            />
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default AlbumPage;
