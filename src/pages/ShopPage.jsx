import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import ProductGrid from '../components/product/ProductGrid';
import Sidebar from '../components/layout/Sidebar'; // Reusing existing Sidebar logic but wrapping it
import { getAllProducts } from '../services/supabase/products';
import { Filter, X } from 'lucide-react';

const ShopPage = () => {
    const { searchQuery, selectedCategory, setSelectedCategory } = useApp();
    const { language, t } = useLanguage();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            const result = await getAllProducts(true);
            if (result.success) {
                setProducts(result.products);
            }
            setLoading(false);
        };
        fetchProducts();
    }, []);

    // Filter products
    const filteredProducts = products.filter(product => {
        const name = product.name?.[language] || '';
        const category = product.category?.[language] || '';
        const subcategory = product.subcategory?.[language] || '';

        const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategory ||
            (category === selectedCategory.category &&
                (!selectedCategory.subcategory || subcategory === selectedCategory.subcategory));
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="container mx-auto px-4 md:px-6 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <h1 className="text-3xl font-display font-bold text-gray-900 mb-4 md:mb-0">
                    {selectedCategory ? `${selectedCategory.category} - ${selectedCategory.subcategory}` : (t('shopAll') || 'Shop All Products')}
                </h1>

                <div className="flex items-center gap-4">
                    <span className="text-gray-500">{filteredProducts.length} results</span>
                    <button
                        className="md:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg font-medium"
                        onClick={() => setShowMobileFilters(true)}
                    >
                        <Filter className="w-5 h-5" /> Filters
                    </button>
                    {/* Sorting could go here */}
                </div>
            </div>

            <div className="flex gap-8">
                {/* Sidebar (Desktop) */}
                <div className="hidden md:block w-64 flex-shrink-0">
                    <Sidebar />
                </div>

                {/* Mobile Sidebar Overlay */}
                {showMobileFilters && (
                    <div className="fixed inset-0 z-50 bg-black/50 md:hidden" onClick={() => setShowMobileFilters(false)}>
                        <div className="absolute right-0 top-0 h-full w-80 bg-white p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">Filters</h2>
                                <button onClick={() => setShowMobileFilters(false)}>
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <Sidebar />
                        </div>
                    </div>
                )}

                {/* Product Grid */}
                <div className="flex-1">
                    {selectedCategory && (
                        <div className="mb-6 flex items-center">
                            <span className="text-gray-600 mr-2">Active Filter:</span>
                            <span className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                                {selectedCategory.subcategory}
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className="ml-2 hover:bg-primary/20 rounded-full p-0.5"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <ProductGrid products={filteredProducts} />
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-xl">
                            <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className="mt-4 text-primary font-medium hover:underline"
                            >
                                Clear filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShopPage;
