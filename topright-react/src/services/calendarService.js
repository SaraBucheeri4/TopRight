import { supabase } from '../config/supabase'

export async function fetchCalendarEvents(year, month) {
  const from = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const to = `${year}-${String(month).padStart(2, '0')}-${lastDay}`

  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .gte('event_date', from)
    .lte('event_date', to)
    .order('event_date')
    .order('start_time', { nullsFirst: true })

  if (error) throw error
  return data ?? []
}

export async function fetchUpcomingEvents(limit = 5) {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .gte('event_date', today)
    .order('event_date')
    .order('start_time', { nullsFirst: true })
    .limit(limit)

  if (error) throw error
  return data ?? []
}

export async function createCalendarEvent(event) {
  const { error } = await supabase
    .from('calendar_events')
    .insert({ ...event, updated_at: new Date().toISOString() })
  if (error) throw error
}

export async function updateCalendarEvent(id, fields) {
  const { error } = await supabase
    .from('calendar_events')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function deleteCalendarEvent(id) {
  const { error } = await supabase.from('calendar_events').delete().eq('id', id)
  if (error) throw error
}
