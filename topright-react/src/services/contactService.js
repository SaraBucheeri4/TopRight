import { supabase } from '../config/supabase'

export async function submitContactForm({ name, organisation, email, project_type, message }) {
  const { error } = await supabase.from('contact_submissions').insert({
    name,
    organisation,
    email,
    project_type,
    message,
  })
  if (error) throw error
}

export async function fetchContactSubmissions() {
  const { data, error } = await supabase
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function deleteContactSubmission(id) {
  const { error } = await supabase.from('contact_submissions').delete().eq('id', id)
  if (error) throw error
}
