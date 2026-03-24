import { useEffect, useMemo, useState } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
import { fetchActiveProducts } from '../api/catalog';
import CategorySection from '../components/CategorySection';
import ProductDetailPanel from '../components/ProductDetailPanel';

function mapError(e) {
  const msg = e?.message || '';
  if (msg === 'ENV_MISSING') {
    return 'Supabase sozlanmagan. catalog-vitrina/.env faylida VITE_SUPABASE_URL va VITE_SUPABASE_ANON_KEY kiriting. Keyin serverni qayta ishga tushiring.';
  }
  if (msg.includes('Failed to fetch') || msg === 'TypeError: Failed to fetch') {
    return 'Internet yoki Supabase ga ulanish yo‘q. URL/kalitni tekshiring.';
  }
  return msg || 'Yuklashda xatolik';
}

export default function CatalogPage() {
  const { categories = [] } = useOutletContext() || {};
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr('');
      try {
        const prods = await fetchActiveProducts();
        if (!cancelled) setProducts(prods);
      } catch (e) {
        if (!cancelled) setErr(mapError(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loading || err) return;
    const hash = location.hash?.replace(/^#/, '');
    if (!hash || !hash.startsWith('cat-')) return;
    const el = document.getElementById(hash);
    if (el) {
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [loading, err, location.hash, products]);

  const sections = useMemo(() => {
    const byCatId = new Map();
    categories.forEach((c) => byCatId.set(c.id, { category: c, products: [] }));

    const uncategorized = [];

    for (const p of products) {
      const cid = p.category_id;
      if (cid && byCatId.has(cid)) {
        byCatId.get(cid).products.push(p);
      } else {
        uncategorized.push(p);
      }
    }

    const ordered = categories
      .map((c) => byCatId.get(c.id))
      .filter((s) => s && s.products.length > 0);

    return { ordered, uncategorized };
  }, [categories, products]);

  return (
    <div
      className={`transition-all duration-300 ${
        selectedProduct ? 'pr-0 sm:pr-[32rem] md:pr-[36rem] lg:pr-[42rem]' : ''
      }`}
    >
      <main className="mx-auto max-w-7xl px-3 py-8 sm:px-4 sm:py-10 md:px-8">
        {loading && (
          <p className="text-center text-stone-600">Yuklanmoqda…</p>
        )}

        {!loading && err && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">
            {err}
          </div>
        )}

        {!loading && !err && products.length === 0 && (
          <p className="text-center text-stone-600">
            Hozircha faol mahsulot yo‘q.
          </p>
        )}

        {!loading && !err && products.length > 0 && (
          <div className="space-y-12 sm:space-y-16">
            {sections.ordered.map(({ category, products: list }) => (
              <CategorySection
                key={category.id}
                category={category}
                products={list}
                onSelectProduct={setSelectedProduct}
              />
            ))}

            {sections.uncategorized.length > 0 && (
              <CategorySection
                category={{
                  id: null,
                  name: 'Boshqa',
                  name_uz: 'Boshqa',
                }}
                products={sections.uncategorized}
                onSelectProduct={setSelectedProduct}
              />
            )}
          </div>
        )}
      </main>

      {selectedProduct && (
        <ProductDetailPanel
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
