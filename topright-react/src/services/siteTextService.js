import { supabase } from '../config/supabase'

export async function fetchSiteText() {
  const { data, error } = await supabase
    .from('site_text')
    .select('*')
    .order('key')
  if (error) throw error
  return data ?? []
}

export async function fetchSiteTextMap() {
  const { data, error } = await supabase
    .from('site_text')
    .select('key, value_en, value_ar')
  if (error) throw error
  const map = {}
  ;(data ?? []).forEach(row => {
    map[row.key] = { value_en: row.value_en, value_ar: row.value_ar }
  })
  return map
}

export async function updateSiteTextRow(id, { value_en, value_ar }) {
  const { error } = await supabase
    .from('site_text')
    .update({ value_en, value_ar, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}
