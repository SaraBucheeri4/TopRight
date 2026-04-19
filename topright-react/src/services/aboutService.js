import { supabase } from '../config/supabase'
import { STORAGE_BUCKET } from '../config/constants'
import { compressImage } from '../utils/compressImage'

export async function fetchAboutContent() {
  const { data, error } = await supabase
    .from('about_content')
    .select('*')
    .limit(1)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data ?? null
}

export async function upsertAboutContent(fields) {
  const { id, ...rest } = fields
  if (id) {
    const { error } = await supabase
      .from('about_content')
      .update({ ...rest, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('about_content')
      .insert({ ...rest, updated_at: new Date().toISOString() })
    if (error) throw error
  }
}

export async function uploadAboutImage(file) {
  const compressed = await compressImage(file, { maxWidth: 800, maxHeight: 800, quality: 0.85 })
  const filename = `about/${Date.now()}.webp`
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(filename, compressed, {
    cacheControl: '3600',
    upsert: false,
    contentType: 'image/webp',
  })
  if (error) throw error
  return filename
}

export function getAboutImageUrl(filename) {
  if (!filename) return null
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filename)
  return data.publicUrl
}
