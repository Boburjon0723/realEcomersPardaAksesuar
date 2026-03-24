/** VITE_CATALOG_LANG: uz | ru | en */
export function getLang() {
  const key = (import.meta.env.VITE_CATALOG_LANG || 'uz').toLowerCase();
  if (key === 'ru' || key === 'en') return key;
  return 'uz';
}

export function albumImageTitle(img) {
  const lang = getLang();
  return (
    img[`title_${lang}`] ||
    img.title_uz ||
    img.title_ru ||
    img.title_en ||
    ''
  );
}
