import { supabase } from '../config/supabase'

export async function fetchFooter() {
  const { data, error } = await supabase
    .from('footer')
    .select('*')
    .limit(1)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data ?? null
}

export async function upsertFooter(fields) {
  const { id, updated_at, ...rest } = fields
  if (id) {
    const { error } = await supabase
      .from('footer')
      .update({ ...rest, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('footer')
      .insert({ ...rest, updated_at: new Date().toISOString() })
    if (error) throw error
  }
}
