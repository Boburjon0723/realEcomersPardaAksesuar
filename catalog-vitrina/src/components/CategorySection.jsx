import ProductCard from './ProductCard';
import { categoryLabel } from '../api/catalog';

export default function CategorySection({ category, products }) {
  const heading = categoryLabel(category);

  return (
    <section className="scroll-mt-24" id={category?.id ? `cat-${category.id}` : 'cat-other'}>
      <h2 className="mb-6 border-b border-stone-200 pb-3 text-2xl font-bold tracking-tight text-brand">
        {heading || 'Boshqa'}
      </h2>
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => (
          <li key={p.id}>
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}
