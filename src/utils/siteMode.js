/**
 * Sayt rejimi: wholesale (optom) yoki retail (chakana).
 * Vercel deploy #1: REACT_APP_SITE_MODE=wholesale
 * Vercel deploy #2: REACT_APP_SITE_MODE=retail
 */
const RAW = String(process.env.REACT_APP_SITE_MODE || 'wholesale').trim().toLowerCase();

export const SITE_MODE = RAW === 'retail' ? 'retail' : 'wholesale';

export const isRetailSite = () => SITE_MODE === 'retail';

export const isWholesaleSite = () => SITE_MODE === 'wholesale';

export const getOrderSource = () =>
    isRetailSite() ? 'website_chakana' : 'website_optom';

export function resolveProductPrice(product) {
    if (!product) return 0;
    if (isRetailSite()) {
        const retail = product.retail_price;
        if (retail !== undefined && retail !== null && retail !== '') {
            return Number(retail) || 0;
        }
    }
    const wholesale = product.sale_price ?? product.price;
    return Number(wholesale || 0);
}
