/**
 * Mahsulot sahifasini ulashish uchun barqaror havola.
 * - Hash (#) qo'shilmaydi (SPA marshrut buzilmasin).
 * - Localhostda REACT_APP_SITE_URL bo'lsa, prod domen bilan ulashiladi (telefonda ochiladigan havola).
 */
export function getShareableUrl() {
    if (typeof window === 'undefined') return '';
    const { pathname, search, hostname, origin } = window.location;
    const path = `${pathname}${search}`;
    const envSite = (process.env.REACT_APP_SITE_URL || '').trim().replace(/\/$/, '');
    const isLocal =
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '[::1]';
    if (isLocal && envSite) {
        return `${envSite}${path}`;
    }
    return `${origin}${path}`;
}
