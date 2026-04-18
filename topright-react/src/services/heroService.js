import { supabase } from '../config/supabase'

export async function fetchHeroContent() {
  const { data, error } = await supabase
    .from('hero_content')
    .select('*')
    .limit(1)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data ?? null
}

export async function upsertHeroContent(fields) {
  const { id, ...rest } = fields
  if (id) {
    const { error } = await supabase
      .from('hero_content')
      .update({ ...rest, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('hero_content')
      .insert({ ...rest, updated_at: new Date().toISOString() })
    if (error) throw error
  }
}
