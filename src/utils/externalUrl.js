/**
 * Tashqi havolalar (Instagram, Facebook) — protokol bo‘lmasa brauzer
 * havolani sayt ichidagi nisbiy yo‘l deb oladi.
 */
export function normalizeExternalUrl(url) {
    if (url == null || typeof url !== 'string') return '';
    let u = url.trim();
    if (!u) return '';
    if (/^(https?:|mailto:|tel:)/i.test(u)) return u;
    if (u.startsWith('//')) return `https:${u}`;
    return `https://${u.replace(/^\/+/, '')}`;
}

/**
 * Telegram maydoni: "t.me/user", "@user" yoki to‘liq https — barchasi to‘g‘ri ochiladi.
 */
export function normalizeTelegramUrl(url) {
    if (url == null || typeof url !== 'string') return '';
    let u = url.trim();
    if (!u) return '';
    if (/^https?:\/\//i.test(u)) return u;
    if (u.startsWith('//')) return `https:${u}`;
    if (u.startsWith('@')) {
        return `https://t.me/${u.replace(/^@+/, '')}`;
    }
    return `https://${u.replace(/^\/+/, '')}`;
}
