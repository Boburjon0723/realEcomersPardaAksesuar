import React from 'react';
import { ChevronRight } from 'lucide-react';

/**
 * Breadcrumb - yo'l ko'rsatgich
 * ShopPage: Bosh sahifa > Do'kon > [Kategoriya]
 * ProductPage: Bosh sahifa > Do'kon > [Kategoriya] > [Mahsulot]
 */
const Breadcrumb = ({ items }) => {
    if (!items || items.length === 0) return null;

    return (
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
            {items.map((item, idx) => (
                <span key={idx} className="flex items-center gap-2">
                    {idx > 0 && <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                    {item.onClick ? (
                        <button
                            onClick={item.onClick}
                            className="hover:text-primary transition-colors font-medium"
                        >
                            {item.label}
                        </button>
                    ) : (
                        <span className="text-gray-900 font-medium">{item.label}</span>
                    )}
                </span>
            ))}
        </nav>
    );
};

export default Breadcrumb;
