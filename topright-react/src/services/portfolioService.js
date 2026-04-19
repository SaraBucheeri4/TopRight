import { supabase } from '../config/supabase'
import { STORAGE_BUCKET } from '../config/constants'
import { compressImage } from '../utils/compressImage'

export function getPublicUrl(filename) {
  if (!filename) return null
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filename)
  return data.publicUrl
}

export async function fetchPublishedPortfolioItems() {
  const { data, error } = await supabase
    .from('portfolio_items')
    .select('*')
    .eq('is_published', true)
    .order('display_order')
  if (error) throw error
  return data ?? []
}

export async function fetchAllPortfolioItems() {
  const { data, error } = await supabase
    .from('portfolio_items')
    .select('*')
    .order('display_order')
  if (error) throw error
  return data ?? []
}

export async function createPortfolioItem(item) {
  const slug = item.slug || `item-${Date.now()}`
  const { error } = await supabase
    .from('portfolio_items')
    .insert({ ...item, slug, updated_at: new Date().toISOString() })
  if (error) throw error
}

export async function updatePortfolioItem(id, fields) {
  const { error } = await supabase
    .from('portfolio_items')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function deletePortfolioItem(id) {
  const { error } = await supabase.from('portfolio_items').delete().eq('id', id)
  if (error) throw error
}

export async function updatePortfolioOrder(items) {
  await Promise.all(
    items.map((item, i) =>
      supabase.from('portfolio_items').update({ display_order: i }).eq('id', item.id)
    )
  )
}

export async function uploadPortfolioImage(file) {
  const compressed = await compressImage(file)
  const filename = `${Date.now()}.webp`
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(filename, compressed, {
    cacheControl: '3600',
    upsert: false,
    contentType: 'image/webp',
  })
  if (error) throw error
  return filename
}
