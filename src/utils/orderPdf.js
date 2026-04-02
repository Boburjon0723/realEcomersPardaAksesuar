import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

/** @type {Record<string, Record<string, string>>} */
const L = {
    uz: {
        docTitle: "Buyurtma varag‘i",
        orderId: 'Buyurtma ID',
        date: 'Sana',
        status: 'Holat',
        customer: 'Mijoz',
        phone: 'Telefon',
        address: 'Manzil',
        note: 'Izoh',
        product: 'Mahsulot',
        color: 'Rang',
        qty: 'Miqdor',
        unitPrice: 'Birlik narxi',
        lineTotal: 'Qator summasi',
        total: 'Jami',
        paymentStatus: 'To‘lov holati',
        sku: 'SKU',
    },
    ru: {
        docTitle: 'Заказ',
        orderId: 'ID заказа',
        date: 'Дата',
        status: 'Статус',
        customer: 'Клиент',
        phone: 'Телефон',
        address: 'Адрес',
        note: 'Примечание',
        product: 'Товар',
        color: 'Цвет',
        qty: 'Кол-во',
        unitPrice: 'Цена',
        lineTotal: 'Сумма строки',
        total: 'Итого',
        paymentStatus: 'Оплата',
        sku: 'Артикул',
    },
    en: {
        docTitle: 'Order details',
        orderId: 'Order ID',
        date: 'Date',
        status: 'Status',
        customer: 'Customer',
        phone: 'Phone',
        address: 'Address',
        note: 'Note',
        product: 'Product',
        color: 'Color',
        qty: 'Qty',
        unitPrice: 'Unit price',
        lineTotal: 'Line total',
        total: 'Total',
        paymentStatus: 'Payment',
        sku: 'SKU',
    },
};

const NOTO_URL =
    'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@bf4258b9/hinted/ttf/NotoSans/NotoSans-Regular.ttf';

function uint8ToBase64(bytes) {
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + chunk, bytes.length)));
    }
    return btoa(binary);
}

async function trySetUnicodeFont(doc) {
    try {
        const res = await fetch(NOTO_URL, { mode: 'cors' });
        if (!res.ok) return null;
        const buf = await res.arrayBuffer();
        const b64 = uint8ToBase64(new Uint8Array(buf));
        doc.addFileToVFS('NotoSans-Regular.ttf', b64);
        doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
        doc.setFont('NotoSans');
        return 'NotoSans';
    } catch {
        return null;
    }
}

function formatMoney(n) {
    const x = Number(n);
    if (!Number.isFinite(x)) return '0';
    return `$${x.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

function lineProductName(item, language) {
    if (item.name && typeof item.name === 'object') {
        return (
            item.name[language] ||
            item.name.uz ||
            item.name.en ||
            item.name.ru ||
            '—'
        );
    }
    return String(item.name || '—');
}

/**
 * @param {object} order - formatted order from getUserOrders
 * @param {{ language?: string, siteName?: string, translateColor?: (c: string) => string, statusLabel?: string }} opts
 */
export async function downloadOrderPdf(order, opts = {}) {
    const language = opts.language === 'ru' ? 'ru' : opts.language === 'en' ? 'en' : 'uz';
    const lang = L[language] || L.uz;
    const site = (opts.siteName || '').trim();
    const translateColor = typeof opts.translateColor === 'function' ? opts.translateColor : (c) => c;

    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const tableFont = await trySetUnicodeFont(doc);
    if (!tableFont) {
        doc.setFont('helvetica');
    }

    let y = 14;
    doc.setFontSize(16);
    doc.setTextColor(5, 77, 59);
    doc.text(lang.docTitle, 14, y);
    doc.setTextColor(33, 33, 33);
    y += 8;

    if (site) {
        doc.setFontSize(10);
        doc.text(site, 14, y);
        y += 6;
    }

    doc.setFontSize(9);
    const metaLines = [
        `${lang.orderId}: ${order.id}`,
        `${lang.date}: ${new Date(order.created_at).toLocaleString(language === 'ru' ? 'ru-RU' : language === 'en' ? 'en-US' : 'uz-UZ')}`,
        `${lang.status}: ${opts.statusLabel || order.status || '—'}`,
    ];
    if (order.customer_name || order.customerName) {
        metaLines.push(`${lang.customer}: ${order.customer_name || order.customerName}`);
    }
    if (order.customer_phone || order.customerPhone) {
        metaLines.push(`${lang.phone}: ${order.customer_phone || order.customerPhone}`);
    }
    if (order.customer_address) {
        metaLines.push(`${lang.address}: ${order.customer_address}`);
    }
    if (order.note) {
        metaLines.push(`${lang.note}: ${order.note}`);
    }
    if (order.payment_status) {
        metaLines.push(`${lang.paymentStatus}: ${order.payment_status}`);
    }

    metaLines.forEach((line) => {
        const lines = doc.splitTextToSize(line, 182);
        lines.forEach((ln) => {
            doc.text(ln, 14, y);
            y += 5;
        });
    });

    y += 4;

    const body = (order.products || []).map((item, idx) => {
        let name = lineProductName(item, language);
        if (item.size) {
            name = `${name} (${lang.sku}: ${item.size})`;
        }
        const colorStr = item.color ? translateColor(item.color) : '—';
        const qty = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        const lineTot = price * qty;
        return [
            String(idx + 1),
            name,
            colorStr,
            String(qty),
            formatMoney(price),
            formatMoney(lineTot),
        ];
    });

    const tableStyles = tableFont
        ? { font: tableFont, fontStyle: 'normal', fontSize: 8, cellPadding: 2 }
        : { fontSize: 8, cellPadding: 2 };

    autoTable(doc, {
        startY: y,
        head: [
            [
                '#',
                lang.product,
                lang.color,
                lang.qty,
                lang.unitPrice,
                lang.lineTotal,
            ],
        ],
        body,
        theme: 'striped',
        headStyles: {
            fillColor: [5, 77, 59],
            textColor: 255,
            ...(tableFont ? { font: tableFont, fontStyle: 'normal' } : {}),
        },
        styles: { ...tableStyles, textColor: 30 },
        columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 62 },
            2: { cellWidth: 28 },
            3: { cellWidth: 16, halign: 'center' },
            4: { cellWidth: 28, halign: 'right' },
            5: { cellWidth: 28, halign: 'right' },
        },
        margin: { left: 14, right: 14 },
    });

    const finalY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : y + 40;
    doc.setFontSize(12);
    if (tableFont) {
        doc.setFont(tableFont, 'normal');
    } else {
        doc.setFont('helvetica', 'bold');
    }
    doc.text(`${lang.total}: ${formatMoney(order.totalAmount)}`, 14, finalY);

    const safeName = String(order.id).replace(/[^a-z0-9-]/gi, '').slice(0, 12) || 'order';
    doc.save(`order-${safeName}.pdf`);
}
