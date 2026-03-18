// Narxni dollorda formatlash (CRM da narx USD da kiritiladi)
export const formatPriceUSD = (price) => {
    if (price == null || isNaN(Number(price))) return '$0';
    const num = Number(price);
    if (num >= 1000) {
        return `$${num.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    }
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
