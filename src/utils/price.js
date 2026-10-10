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

/** 1 dona (yoki kg rejimida 1 kg) uchun saqlangan og'irlik. Bo'sh yoki 0 — 0. */
export function unitKg(raw) {
    const n = Number(String(raw ?? '').trim().replace(',', '.'));
    if (!Number.isFinite(n) || n <= 0) return 0;
    return n;
}

export function formatKg(n) {
    const r = Math.round((Number(n) || 0) * 1000) / 1000;
    if (!Number.isFinite(r) || r <= 0) return '0';
    return r.toLocaleString('en-US', { maximumFractionDigits: 3 });
}

/** 1000 kg dan boshlab tonna. 1100 → "1 tonna 100 kg". */
export function formatWeightSpoken(kg, tonLabel = 'tonna') {
    const n = Math.round((Number(kg) || 0) * 1000) / 1000;
    if (n >= 1000) {
        const tons = Math.floor(n / 1000);
        const rest = Math.round((n - tons * 1000) * 1000) / 1000;
        if (rest <= 0) return `${tons} ${tonLabel}`;
        return `${tons} ${tonLabel} ${formatKg(rest)} kg`;
    }
    return `${formatKg(n)} kg`;
}

/**
 * Bir xil sig‘imdagi aniq mahsulotlar birga yig‘iladi.
 * 3 × 20 dona, sig‘im 16 → 60 dona → 4 ta katta karobka.
 */
export function poolExactBoxes(items) {
    const groups = new Map();
    for (const item of items || []) {
        const pack = Math.floor(Number(item?.master_pack_qty) || 0);
        const qty = Number(item?.quantity) || 0;
        if (pack < 2 || qty <= 0) continue;
        const key = String(pack);
        let group = groups.get(key);
        if (!group) {
            group = { pack, qty: 0, boxKgs: [] };
            groups.set(key, group);
        }
        group.qty += qty;
        const kg = unitKg(item?.master_box_kg);
        if (kg > 0) group.boxKgs.push(Math.round(kg * 1000) / 1000);
    }
    let masters = 0;
    let tare = 0;
    for (const group of groups.values()) {
        const boxes = Math.ceil(group.qty / group.pack);
        masters += boxes;
        const kg = group.boxKgs.length && group.boxKgs.every((v) => v === group.boxKgs[0])
            ? group.boxKgs[0]
            : (group.boxKgs[0] || 0);
        tare += boxes * kg;
    }
    return { masters, tare: Math.round(tare * 1000) / 1000 };
}

/** Kichik karobka = 1 dona brutto. Katta karobka soni alohida, bir xil sig‘im bo‘yicha yig‘iladi. */
export function linePacking(item, qty) {
    const q = Number(qty) || 0;
    const pack = Math.floor(Number(item?.master_pack_qty) || 0);
    const usePack = pack >= 2 && q > 0;
    const masters = 0;
    const loose = 0;
    const netto = unitKg(item?.netto_kg) * q;
    const smallBrutto = unitKg(item?.brutto_kg) * q;
    const gross = smallBrutto;
    return {
        netto,
        smallBrutto,
        gross,
        masters,
        loose,
        pack: usePack ? pack : 0,
        any: netto > 0 || smallBrutto > 0 || masters > 0,
        knownPack: usePack,
    };
}

/** Sig‘im 2 va undan katta bo‘lsa aniq. Bo‘sh yoki 0 — noaniq. */
export function hasKnownMasterPack(item) {
    return Math.floor(Number(item?.master_pack_qty) || 0) >= 2;
}

/** Vazni bor, lekin katta karobka sig‘imi yozilmagan qator. */
export function lineNeedsManualMaster(item) {
    const hasWeight = unitKg(item?.netto_kg) > 0 || unitKg(item?.brutto_kg) > 0;
    return hasWeight && !hasKnownMasterPack(item);
}

/** Noaniq qatordagi bo‘sh katta karobka kg. Hammasi bir xil bo‘lsa shu son, aks holda null. */
export function sharedMasterBoxKg(items) {
    const values = [];
    for (const item of items || []) {
        const kg = unitKg(item?.master_box_kg);
        if (kg > 0) values.push(Math.round(kg * 1000) / 1000);
    }
    if (!values.length) return null;
    const first = values[0];
    return values.every((v) => v === first) ? first : null;
}

/** Vitrinta: "$10.00 / kg · 1 kg" yoki og'irlik bo'lmasa "$10.00 / kg" */
export const formatProductPriceDisplay = (price, product) => {
    const isKg = Boolean(product?.is_kg);
    const base = formatPriceUSD(price);
    if (!isKg) return base;
    const w = getProductWeightLabel(product);
    if (w) return `${base} / kg · ${w}`;
    return `${base} / kg`;
};
