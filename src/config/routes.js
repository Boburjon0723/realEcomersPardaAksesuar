/** SPA marshrutlari — URL va `currentPage` nomi mosligi */

export const PAGE_PATHS = {
  home: '/',
  shop: '/shop',
  cart: '/cart',
  checkout: '/checkout',
  about: '/about',
  services: '/services',
  contact: '/contact',
  orders: '/orders',
  profile: '/profile',
  album: '/album',
  shipping: '/shipping',
  returns: '/returns',
  faq: '/faq',
  terms: '/terms',
  privacy: '/privacy',
  adminCatalogOrder: '/admin/catalog-order',
};

const STATIC_SEGMENTS = new Set([
  'shop',
  'cart',
  'checkout',
  'about',
  'services',
  'contact',
  'orders',
  'profile',
  'album',
  'shipping',
  'returns',
  'faq',
  'terms',
  'privacy',
]);

/**
 * URL dan mantiqiy sahifa nomi (header, aktiv holat)
 */
export function pathToPage(pathname) {
  const p = pathname || '/';
  if (p === '/' || p === '') return 'home';
  if (p.startsWith('/product/')) return 'product';
  const seg = p.replace(/^\//, '').split('/')[0];
  if (STATIC_SEGMENTS.has(seg)) return seg;
  return 'notfound';
}

export function pageToPath(page) {
  if (page === 'home') return '/';
  return PAGE_PATHS[page] || '/';
}
