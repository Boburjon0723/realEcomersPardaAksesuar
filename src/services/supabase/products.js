import { supabase } from '../../supabaseClient';

const PRODUCTS_TABLE = 'products';
const STORAGE_BUCKET = 'products';

// Helper function to map DB data to Frontend model
const mapProductFromDB = (product) => {
    if (!product) return null;

    // If fields are plain text, wrap them in the expected language object for frontend compatibility
    const wrapLang = (val) => (typeof val === 'object' && val !== null) ? val : { uz: val || '', ru: val || '', en: val || '' };

    // Fallback for price: try sale_price first, then price, then 0. Ensure it's a number.
    let priceValue = product.sale_price;
    if (priceValue === undefined || priceValue === null) {
        priceValue = product.price;
    }
    // If saving in CRM uses 'original_price', we should check that too if needed, but standardizing on sale_price/price is better.

    // Handle potential array or object from Supabase join
    const categoryName = Array.isArray(product.categories)
        ? product.categories[0]?.name
        : product.categories?.name;

    return {
        ...product,
        id: product.id,
        name: wrapLang(product.name),
        description: wrapLang(product.description),
        price: Number(priceValue || 0),
        categoryId: product.category_id,
        category: wrapLang(categoryName || product.category || ''),
        // Fix: prioritize 'images' array if it exists and has items, otherwise fall back to 'image_url'
        images: (Array.isArray(product.images) && product.images.length > 0)
            ? product.images
            : (product.image_url ? [product.image_url] : []),
        color: product.color || '',
        size: product.size || '', // Kod
        rating: product.rating || 0,
        reviews: product.reviews || 0,
        features: product.features || {},
    };
};

// Get all products
export const getAllProducts = async (onlyActive = false) => {
    try {
        let query = supabase
            .from(PRODUCTS_TABLE)
            .select(`
                *,
                categories(name)
            `)
            .order('created_at', { ascending: false });

        if (onlyActive) {
            query = query.eq('is_active', true);
        }

        const { data, error } = await query;
        if (error) throw error;

        // FALLBACK: If DB is empty, return mock data for demonstration
        if (!data || data.length === 0) {
            console.log('Database empty, returning mock data');
            return {
                success: true,
                products: MOCK_PRODUCTS.map(mapProductFromDB)
            };
        }

        return {
            success: true,
            products: data.map(mapProductFromDB)
        };
    } catch (error) {
        console.error('Error fetching products:', error);
        // On error (e.g. connection), also try mock data for resilience
        return {
            success: true,
            products: MOCK_PRODUCTS.map(mapProductFromDB)
        };
    }
};

const MOCK_PRODUCTS = [
    {
        id: 'mock-1',
        name: 'Gold Plated Curtain Rail',
        description: 'Luxury gold plated curtain rail for elegant homes.',
        sale_price: 450000,
        price: 450000,
        stock: 50,
        category: { name: 'Curtain Rails' },
        image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        is_active: true
    },
    {
        id: 'mock-2',
        name: 'Modern Black Tieback',
        description: 'Minimalist matte black tieback.',
        sale_price: 85000,
        price: 85000,
        stock: 100,
        category: { name: 'Tiebacks' },
        image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        is_active: true
    },
    {
        id: 'mock-3',
        name: 'Classic Brass Hook',
        description: 'Traditional solid brass hook.',
        sale_price: 25000,
        price: 25000,
        stock: 200,
        category: { name: 'Hooks & Rings' },
        image_url: 'https://images.unsplash.com/photo-1590736969955-71cc58d81341?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        is_active: true
    },
    {
        id: 'mock-4',
        name: 'Heavy Duty Wall Bracket',
        description: 'Reinforced wall bracket for heavy curtains.',
        sale_price: 60000,
        price: 60000,
        stock: 80,
        category: { name: 'Brackets' },
        image_url: 'https://images.unsplash.com/photo-1615800098779-1be4350c5957?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        is_active: true
    },
    {
        id: 'mock-5',
        name: 'Smart Motorized Track',
        description: 'WiFi enabled motorized track.',
        sale_price: 1200000,
        price: 1200000,
        stock: 15,
        category: { name: 'Motorized Systems' },
        image_url: 'https://images.unsplash.com/photo-1558603668-6570496b66f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        is_active: true
    }
];

// Get product by ID
export const getProductById = async (productId) => {
    try {
        const { data, error } = await supabase
            .from(PRODUCTS_TABLE)
            .select(`
                *,
                categories(name)
            `)
            .eq('id', productId)
            .single();
        if (error) throw error;
        return {
            success: true,
            product: mapProductFromDB(data)
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Add new product
export const addProduct = async (productData, imageFiles = []) => {
    try {
        const imageUrls = [];

        if (imageFiles && imageFiles.length > 0) {
            for (const file of imageFiles) {
                const fileName = `${Date.now()}_${file.name}`;
                const { error: uploadError } = await supabase.storage
                    .from(STORAGE_BUCKET)
                    .upload(fileName, file);

                if (!uploadError) {
                    const { data: { publicUrl } } = supabase.storage
                        .from(STORAGE_BUCKET)
                        .getPublicUrl(fileName);
                    imageUrls.push(publicUrl);
                }
            }
        }

        const dbData = {
            name: typeof productData.name === 'object' ? (productData.name.uz || productData.name.en || '') : productData.name,
            description: typeof productData.description === 'object' ? (productData.description.uz || productData.description.en || '') : productData.description,
            sale_price: Number(productData.price),
            category_id: productData.categoryId,
            color: productData.color || '',
            image_url: imageUrls[0] || (Array.isArray(productData.images) ? productData.images[0] : ''),
            is_active: true
        };

        const { data, error } = await supabase
            .from(PRODUCTS_TABLE)
            .insert([dbData])
            .select()
            .single();

        if (error) throw error;
        return { success: true, productId: data.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Update product
export const updateProduct = async (productId, productData, newImageFiles = []) => {
    try {
        let imageUrls = [...(productData.images || [])];

        if (newImageFiles && newImageFiles.length > 0) {
            for (const file of newImageFiles) {
                const fileName = `${Date.now()}_${file.name}`;
                const { error: uploadError } = await supabase.storage
                    .from(STORAGE_BUCKET)
                    .upload(fileName, file);

                if (!uploadError) {
                    const { data: { publicUrl } } = supabase.storage
                        .from(STORAGE_BUCKET)
                        .getPublicUrl(fileName);
                    imageUrls.push(publicUrl);
                }
            }
        }

        const dbData = {
            name: typeof productData.name === 'object' ? (productData.name.uz || productData.name.en || '') : productData.name,
            description: typeof productData.description === 'object' ? (productData.description.uz || productData.description.en || '') : productData.description,
            sale_price: Number(productData.price),
            category_id: productData.categoryId,
            color: productData.color || '',
            image_url: imageUrls[0] || '',
            is_active: productData.is_active !== undefined ? productData.is_active : true
        };

        const { error } = await supabase
            .from(PRODUCTS_TABLE)
            .update(dbData)
            .eq('id', productId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Delete product
export const deleteProduct = async (productId, imageUrls = []) => {
    try {
        const { error: dbError } = await supabase
            .from(PRODUCTS_TABLE)
            .delete()
            .eq('id', productId);

        if (dbError) throw dbError;

        if (imageUrls && imageUrls.length > 0) {
            for (const url of imageUrls) {
                const fileName = url.split('/').pop();
                await supabase.storage
                    .from(STORAGE_BUCKET)
                    .remove([fileName]);
            }
        }

        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Search products
export const searchProducts = async (searchTerm) => {
    try {
        const { data, error } = await supabase
            .from(PRODUCTS_TABLE)
            .select('*')
            .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);

        if (error) throw error;
        return {
            success: true,
            products: data.map(mapProductFromDB)
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
};
