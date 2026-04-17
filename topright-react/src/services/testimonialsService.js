import { supabase } from '../config/supabase'

export async function fetchAllTestimonials() {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('display_order')
  if (error) throw error
  return data ?? []
}

export async function fetchPublishedTestimonials() {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('is_published', true)
    .order('display_order')
  if (error) throw error
  return data ?? []
}

export async function createTestimonial(testimonial) {
  const { error } = await supabase.from('testimonials').insert(testimonial)
  if (error) throw error
}

export async function updateTestimonial(id, fields) {
  const { error } = await supabase.from('testimonials').update(fields).eq('id', id)
  if (error) throw error
}

export async function deleteTestimonial(id) {
  const { error } = await supabase.from('testimonials').delete().eq('id', id)
  if (error) throw error
}

export async function updateTestimonialsOrder(testimonials) {
  await Promise.all(
    testimonials.map((t, i) => supabase.from('testimonials').update({ display_order: i }).eq('id', t.id))
  )
}
