/**
 * Katalog tartibi: sort_order → mahsulot kodi (size) → lokal nom
 * @param {object} a
 * @param {object} b
 * @param {string} language uz | ru | en
 */
export function compareProductsSizeName(a, b, language = 'uz') {
    const sa = String(a?.size ?? '').trim();
    const sb = String(b?.size ?? '').trim();
    const codeCmp = sa.localeCompare(sb, undefined, { numeric: true, sensitivity: 'base' });
    if (codeCmp !== 0) return codeCmp;
    const na = String(a?.[`name_${language}`] ?? a?.name ?? '');
    const nb = String(b?.[`name_${language}`] ?? b?.name ?? '');
    return na.localeCompare(nb, undefined, { sensitivity: 'base' });
}

export function compareProductsCatalog(a, b, language = 'uz') {
    const so = (Number(a?.sort_order) || 0) - (Number(b?.sort_order) || 0);
    if (so !== 0) return so;
    return compareProductsSizeName(a, b, language);
}

/**
 * @param {object[]} items
 * @param {'newest'|'price_asc'|'price_desc'} sortBy
 * @param {string} language
 */
export function sortProductsForDisplay(items, sortBy, language = 'uz') {
    const copy = [...items];
    if (sortBy === 'price_asc') {
        copy.sort((a, b) => {
            const pa = Number(a?.price) || 0;
            const pb = Number(b?.price) || 0;
            if (pa !== pb) return pa - pb;
            return compareProductsCatalog(a, b, language);
        });
    } else if (sortBy === 'price_desc') {
        copy.sort((a, b) => {
            const pa = Number(a?.price) || 0;
            const pb = Number(b?.price) || 0;
            if (pa !== pb) return pb - pa;
            return compareProductsCatalog(a, b, language);
        });
    } else {
        copy.sort((a, b) => {
            const so = (Number(a?.sort_order) || 0) - (Number(b?.sort_order) || 0);
            if (so !== 0) return so;
            const dateB = new Date(b?.created_at || 0).getTime();
            const dateA = new Date(a?.created_at || 0).getTime();
            if (dateB !== dateA) return dateB - dateA;
            return compareProductsSizeName(a, b, language);
        });
    }
    return copy;
}
