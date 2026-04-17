import { supabase } from '../config/supabase'
import { STORAGE_BUCKET } from '../config/constants'

export async function fetchAllClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('display_order')
  if (error) throw error
  return data ?? []
}

export async function fetchPublishedClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('is_published', true)
    .order('display_order')
  if (error) throw error
  return data ?? []
}

export async function createClient(client) {
  const { error } = await supabase.from('clients').insert(client)
  if (error) throw error
}

export async function updateClient(id, fields) {
  const { error } = await supabase.from('clients').update(fields).eq('id', id)
  if (error) throw error
}

export async function deleteClient(id) {
  const { error } = await supabase.from('clients').delete().eq('id', id)
  if (error) throw error
}

export async function updateClientsOrder(clients) {
  await Promise.all(
    clients.map((c, i) => supabase.from('clients').update({ display_order: i }).eq('id', c.id))
  )
}

export async function uploadClientLogo(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  const filename = `clients/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(filename, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  })
  if (error) throw error
  return filename
}

export function getClientLogoUrl(filename) {
  if (!filename) return null
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filename)
  return data.publicUrl
}
