export const curtainProducts = [
    {
        id: 1,
        name: {
            uz: "Ipak Parda - Premium",
            ru: "Шелковая Штора - Премиум",
            en: "Silk Curtain - Premium"
        },
        price: 450000,
        oldPrice: 550000,
        category: {
            uz: "Pardalar",
            ru: "Шторы",
            en: "Curtains"
        },
        subcategory: {
            uz: "Premium",
            ru: "Премиум",
            en: "Premium"
        },
        images: [
            "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=500",
            "https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?w=500",
            "https://images.unsplash.com/photo-1616486700797-4bd32e5a3b7a?w=500"
        ],
        description: {
            uz: "Yuqori sifatli ipak pardalar, zamonaviy dizayn",
            ru: "Высококачественные шелковые шторы, современный дизайн",
            en: "High-quality silk curtains, modern design"
        },
        features: {
            uz: ["100% ipak", "Yuvish mumkin", "UV himoya", "3 yillik kafolat"],
            ru: ["100% шелк", "Можно стирать", "Защита от UV", "3 года гарантии"],
            en: ["100% silk", "Washable", "UV protection", "3-year warranty"]
        },
        rating: 4.8,
        reviews: 145,
        stock: 25,
        priceRanges: [
            { min: 1, max: 50, discount: 0 },
            { min: 51, max: 100, discount: 5 },
            { min: 101, max: 999, discount: 10 }
        ]
    },
    // ... boshqa mahsulotlar
];

export const categories = [
    {
        name: { uz: "Pardalar", ru: "Шторы", en: "Curtains" },
        subcategories: [
            { uz: "Premium", ru: "Премиум", en: "Premium" },
            { uz: "Klassik", ru: "Классические", en: "Classic" },
            { uz: "Zamonaviy", ru: "Современные", en: "Modern" }
        ]
    },
    {
        name: { uz: "Aksessuarlar", ru: "Аксессуары", en: "Accessories" },
        subcategories: [
            { uz: "Uskunalar", ru: "Оборудование", en: "Hardware" },
            { uz: "Bezaklar", ru: "Украшения", en: "Decorations" }
        ]
    },
    // ... boshqa kategoriyalar
];