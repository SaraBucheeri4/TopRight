import { supabase } from '../config/supabase'

export async function fetchPublishedWhyItems() {
  const { data, error } = await supabase
    .from('why_items')
    .select('*')
    .eq('is_published', true)
    .order('display_order')
  if (error) throw error
  return data ?? []
}

export async function fetchAllWhyItems() {
  const { data, error } = await supabase
    .from('why_items')
    .select('*')
    .order('display_order')
  if (error) throw error
  return data ?? []
}

export async function createWhyItem(fields) {
  const { error } = await supabase.from('why_items').insert(fields)
  if (error) throw error
}

export async function updateWhyItem(id, fields) {
  const { error } = await supabase
    .from('why_items')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function deleteWhyItem(id) {
  const { error } = await supabase.from('why_items').delete().eq('id', id)
  if (error) throw error
}

export async function updateWhyOrder(items) {
  await Promise.all(items.map((item, i) =>
    supabase.from('why_items').update({ display_order: i }).eq('id', item.id)
  ))
}
