/**
 * Aloqa sahifasi xaritasi: Supabase settings (latitude, longitude, address)
 * yoki .env orqali to'liq embed URL.
 */

function parseCoord(value) {
    if (value === null || value === undefined || value === '') return NaN;
    const n = Number(value);
    return Number.isFinite(n) ? n : NaN;
}

/**
 * @param {object} settings - getSettings() natijasi
 * @returns {string|null} iframe uchun src yoki null
 */
export function getContactMapEmbedUrl(settings) {
    const override =
        typeof process.env.REACT_APP_CONTACT_MAP_EMBED_URL === 'string'
            ? process.env.REACT_APP_CONTACT_MAP_EMBED_URL.trim()
            : '';
    if (override) return override;

    const lat = parseCoord(settings?.latitude);
    const lng = parseCoord(settings?.longitude);
    const validCoords =
        !Number.isNaN(lat) &&
        !Number.isNaN(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180;

    if (validCoords) {
        const d = 0.025;
        const bbox = `${lng - d},${lat - d},${lng + d},${lat + d}`;
        return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik`;
    }

    const addr = (settings?.address || '').trim();
    if (addr) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(addr)}&z=15&output=embed`;
    }

    return null;
}

/**
 * Yangi oynada ochish uchun (Google Maps qidiruv)
 * @param {object} settings
 * @returns {string|null}
 */
export function getContactMapExternalUrl(settings) {
    const lat = parseCoord(settings?.latitude);
    const lng = parseCoord(settings?.longitude);
    const validCoords =
        !Number.isNaN(lat) &&
        !Number.isNaN(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180;

    if (validCoords) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
    }

    const addr = (settings?.address || '').trim();
    if (addr) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
    }

    return null;
}
