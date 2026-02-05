import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getAllCategories } from '../../services/supabase/categories';

const Sidebar = () => {
    const { selectedCategory, setSelectedCategory } = useApp();
    const { t } = useLanguage();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            const result = await getAllCategories();
            if (result.success) {
                setCategories(result.categories || []);
            }
            setLoading(false);
        };
        fetchCategories();
    }, []);

    // Helper to handle selection. Since DB doesn't have subcategories, we just set category.
    const handleCategoryClick = (categoryName) => {
        if (selectedCategory?.category === categoryName && !selectedCategory?.subcategory) {
            setSelectedCategory(null); // Deselect
        } else {
            setSelectedCategory({ category: categoryName, subcategory: null });
        }
    };

    if (loading) {
        return <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 animate-pulse h-64"></div>;
    }

    return (
        <aside className="bg-gray-50 rounded-xl p-6 border border-gray-100 sticky top-24">
            <h3 className="font-display font-bold text-lg mb-6 pb-2 border-b border-gray-200">
                {t('categories') || 'Categories'}
            </h3>
            <div className="space-y-2">
                <button
                    onClick={() => setSelectedCategory(null)}
                    className={`block w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${!selectedCategory
                        ? 'bg-primary text-white font-bold'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-primary'
                        }`}
                >
                    {t('allCategories') || 'All Categories'}
                </button>

                {categories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => handleCategoryClick(category.name)}
                        className={`block w-full text-left px-4 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${selectedCategory?.category === category.name
                            ? 'bg-white border-l-4 border-primary text-primary font-bold shadow-sm'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-primary'
                            }`}
                    >
                        <span>{category.name}</span>
                        {selectedCategory?.category === category.name && <ChevronRight className="w-4 h-4" />}
                    </button>
                ))}
            </div>

            {/* Price Filter (Placeholder) */}
            <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="font-display font-bold text-lg mb-4">Price Range</h3>
                <div className="bg-white p-4 rounded border border-gray-200 text-center text-gray-500 text-sm">
                    Price filter coming soon
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;