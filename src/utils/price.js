// Narxni dollorda formatlash (CRM da narx USD da kiritiladi)
export const formatPriceUSD = (price) => {
    if (price == null || isNaN(Number(price))) return '$0';
    const num = Number(price);
    if (num >= 1000) {
        return `$${num.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    }
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Kg mahsulotlar uchun "$10.00 / kg" ko'rinishida chiqarish
export const formatPriceUSDWithUnit = (price, isKg) => {
    const base = formatPriceUSD(price);
    return isKg ? `${base} / kg` : base;
};

const WEIGHT_KEYS = new Set([
    "og'irligi (kg)",
    'вес (кг)',
    'weight (kg)',
]);

const normalizeWeightValue = (v) => {
    const s = String(v ?? '').trim();
    if (!s) return '';
    const n = Number(s.replace(',', '.'));
    if (Number.isFinite(n)) return `${n} kg`;
    return s.toLowerCase().endsWith('kg') ? s : `${s} kg`;
};

// products.features dan kg qiymatini topish (CRM dagi Weight (kg) qatoridan)
export const getProductWeightLabel = (product) => {
    const f = product?.features;
    if (!f || typeof f !== 'object') return '';

    const scanRows = (rows) => {
        if (!Array.isArray(rows)) return '';
        for (const row of rows) {
            if (!row || typeof row !== 'object') continue;
            const name = String(row.name ?? '').trim().toLowerCase();
            if (!WEIGHT_KEYS.has(name)) continue;
            return normalizeWeightValue(row.value);
        }
        return '';
    };

    return scanRows(f.uz) || scanRows(f.ru) || scanRows(f.en) || '';
};

/** Vitrinta: "$10.00 / kg · 1 kg" yoki og'irlik bo'lmasa "$10.00 / kg" */
export const formatProductPriceDisplay = (price, product) => {
    const isKg = Boolean(product?.is_kg);
    const base = formatPriceUSD(price);
    if (!isKg) return base;
    const w = getProductWeightLabel(product);
    if (w) return `${base} / kg · ${w}`;
    return `${base} / kg`;
};
