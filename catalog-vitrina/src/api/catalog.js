import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { getLang } from './lang.js';

function ensureClient() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('ENV_MISSING');
  }
}

export function categoryLabel(cat) {
  if (!cat) return '';
  const lang = getLang();
  return (
    cat[`name_${lang}`] ||
    cat.name_uz ||
    cat.name ||
    ''
  );
}

export function productTitle(p) {
  const lang = getLang();
  return (
    p[`name_${lang}`] ||
    p.name_uz ||
    p.name ||
    ''
  );
}

export function productDescription(p) {
  const lang = getLang();
  const text =
    p[`description_${lang}`] ||
    p.description_uz ||
    p.description ||
    '';
  return text ? String(text).trim() : '';
}

export async function fetchCategories() {
  ensureClient();
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, name_uz, name_ru, name_en')
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function fetchActiveProducts() {
  ensureClient();
  const { data, error } = await supabase
    .from('products')
    .select(
      `
      id,
      name,
      name_uz,
      name_ru,
      name_en,
      description,
      description_uz,
      description_ru,
      description_en,
      category_id,
      image_url,
      images,
      is_active,
      created_at,
      categories ( id, name, name_uz, name_ru, name_en )
    `
    )
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export function productImageUrl(p) {
  if (Array.isArray(p.images) && p.images.length > 0) return p.images[0];
  if (p.image_url) return p.image_url;
  return null;
}
