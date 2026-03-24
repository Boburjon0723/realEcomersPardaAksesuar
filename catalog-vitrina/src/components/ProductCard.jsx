import { productTitle, productDescription, productImageUrl } from '../api/catalog';

export default function ProductCard({ product }) {
  const title = productTitle(product);
  const desc = productDescription(product);
  const img = productImageUrl(product);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm transition hover:border-brand/30 hover:shadow-md">
      <div className="aspect-[4/3] w-full overflow-hidden bg-stone-100">
        {img ? (
          <img
            src={img}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-stone-400">—</div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold leading-snug text-stone-900 line-clamp-2">{title}</h3>
        {desc ? (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-stone-600">{desc}</p>
        ) : null}
      </div>
    </article>
  );
}
