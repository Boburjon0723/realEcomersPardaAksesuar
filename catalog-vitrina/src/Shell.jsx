import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import HeaderNav from './components/HeaderNav';
import { fetchCategories } from './api/catalog';

const SITE_NAME = import.meta.env.VITE_SITE_NAME || 'Katalog';

export default function Shell() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cats = await fetchCategories();
        if (!cancelled) setCategories(cats);
      } catch {
        if (!cancelled) setCategories([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderNav categories={categories} />
      <Outlet context={{ categories }} />
      <footer className="mt-auto border-t border-stone-200 py-8 text-center text-sm text-stone-500">
        {SITE_NAME} — faqat katalog (narx va sharhlar yo‘q)
      </footer>
    </div>
  );
}
