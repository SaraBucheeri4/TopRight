import { supabase } from '../config/supabase'

export async function fetchContactInfo() {
  const { data, error } = await supabase
    .from('contact_info')
    .select('*')
    .limit(1)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data ?? null
}

export async function upsertContactInfo(fields) {
  const { id, updated_at, ...rest } = fields
  if (id) {
    const { error } = await supabase
      .from('contact_info')
      .update({ ...rest, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('contact_info')
      .insert({ ...rest, updated_at: new Date().toISOString() })
    if (error) throw error
  }
}
