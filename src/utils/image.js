// Rasmni Canvas yordamida siqish (frontend compression)
export const compressImage = async (file, maxWidth = 1200, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        // Agar fayl turi rasm bo'lmasa, shunchaki o'zini qaytaramiz
        if (!file.type.startsWith('image/')) {
            resolve(file);
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        // Blob'ni File obyektiga o'girish
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    } else {
                        reject(new Error('Canvas toBlob failed'));
                    }
                }, 'image/jpeg', quality);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

// Supabase URL ga transform parametrlarini qo'shish
export const getOptimizedImageUrl = (url, width, quality = 80) => {
    if (!url) return '';
    // Faqat Supabase public storage URL bo'lsa transform ishlaydi
    if (url.includes('supabase.co/storage/v1/object/public/')) {
        // Agar allaqachon so'rov parametrlari bo'lsa, davomidan qo'shamiz
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}width=${width}&quality=${quality}`;
    }
    return url;
};
