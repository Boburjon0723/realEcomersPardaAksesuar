import { Link, useLocation } from 'react-router-dom';
import { categoryLabel } from '../api/catalog';

const SITE_NAME = import.meta.env.VITE_SITE_NAME || 'Katalog';

export default function HeaderNav({ categories = [] }) {
  const { pathname } = useLocation();
  const isCatalog = pathname === '/' || pathname === '';
  const isAlbum = pathname === '/album';

  const navBtn =
    'rounded-full px-4 py-2 text-sm font-semibold transition whitespace-nowrap';
  const active = 'bg-brand text-white shadow-sm';
  const inactive = 'bg-stone-100 text-stone-700 hover:bg-stone-200';

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="text-lg font-bold text-brand md:text-xl">
            {SITE_NAME}
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              to="/"
              className={`${navBtn} ${isCatalog ? active : inactive}`}
            >
              Katalog
            </Link>
            <Link
              to="/album"
              className={`${navBtn} ${isAlbum ? active : inactive}`}
            >
              Albom
            </Link>
          </nav>
        </div>

        {categories.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link
              to="/"
              className="shrink-0 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-600 hover:border-brand/40 hover:text-brand"
            >
              Barchasi
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/#cat-${cat.id}`}
                className="shrink-0 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-600 hover:border-brand/40 hover:text-brand"
              >
                {categoryLabel(cat) || cat.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
