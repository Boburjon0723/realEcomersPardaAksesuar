import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import ProductGrid from '../components/product/ProductGrid';
import Sidebar from '../components/layout/Sidebar'; // Reusing existing Sidebar logic but wrapping it
import { getAllProducts } from '../services/supabase/products';
import { getAllCategories } from '../services/supabase/categories';
import { Filter, X, Search } from 'lucide-react';

const ShopPage = () => {
    const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory } = useApp();
    const { language, t } = useLanguage();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [productsResult, categoriesResult] = await Promise.all([
                getAllProducts(true),
                getAllCategories()
            ]);

            if (productsResult.success) setProducts(productsResult.products);
            if (categoriesResult.success) setCategories(categoriesResult.categories);

            setLoading(false);
        };
        fetchData();
    }, []);

    // Filter products
    const filteredProducts = products.filter(product => {
        const searchTerms = searchQuery.toLowerCase().split(' ').filter(word => word.length > 0);

        const localizedName = product[`name_${language}`]?.toLowerCase() || product.name?.toLowerCase() || '';
        const code = product.size?.toLowerCase() || '';
        const colors = product.colors || [];
        const categoryName = product.categories?.name?.toLowerCase() || '';

        const matchesSearch = searchTerms.length === 0 || searchTerms.every(term => {
            const inName = localizedName.includes(term);
            const inCode = code.includes(term);
            const inColors = colors.some(c => c.toLowerCase().includes(term));
            const inCategory = categoryName.includes(term);

            return inName || inCode || inColors || inCategory;
        });

        const matchesCategory = !selectedCategory ||
            (product.categories?.name === selectedCategory.category);

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="container mx-auto px-4 md:px-6 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <h1 className="text-3xl font-display font-bold text-gray-900 mb-4 md:mb-0">
                    {selectedCategory ? (
                        categories.find(c => c.name === selectedCategory.category)?.[`name_${language}`] || selectedCategory.category
                    ) : (t('shopAll') || 'Shop All Products')}
                </h1>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    {/* Search Bar */}
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('search') || "Search..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm text-sm"
                        />
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                        <span className="text-gray-500 text-sm whitespace-nowrap">{filteredProducts.length} results</span>
                        <button
                            className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl font-medium text-sm shadow-sm"
                            onClick={() => setShowMobileFilters(true)}
                        >
                            <Filter className="w-4 h-4" /> Filters
                        </button>
                    </div>
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
                            <span className="text-gray-600 mr-2">{t('activeFilter') || 'Active Filter'}:</span>
                            <span className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                                {categories.find(c => c.name === selectedCategory.category)?.[`name_${language}`] || selectedCategory.category}
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
