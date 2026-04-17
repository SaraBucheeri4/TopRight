import { supabase } from '../config/supabase'

export async function fetchAllServices() {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('display_order')
  if (error) throw error
  return data ?? []
}

export async function fetchPublishedServices() {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_published', true)
    .order('display_order')
  if (error) throw error
  return data ?? []
}

export async function createService(service) {
  const { error } = await supabase.from('services').insert(service)
  if (error) throw error
}

export async function updateService(id, fields) {
  const { error } = await supabase.from('services').update(fields).eq('id', id)
  if (error) throw error
}

export async function deleteService(id) {
  const { error } = await supabase.from('services').delete().eq('id', id)
  if (error) throw error
}

export async function updateServicesOrder(services) {
  await Promise.all(
    services.map((s, i) => supabase.from('services').update({ display_order: i }).eq('id', s.id))
  )
}
