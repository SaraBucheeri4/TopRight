import { supabase } from '../config/supabase'

export async function fetchDashboardCounts() {
  const [{ data: p }, { data: t }, { data: c }] = await Promise.all([
    supabase.from('portfolio_items').select('id, is_published'),
    supabase.from('site_text').select('id'),
    supabase.from('contact_submissions').select('id'),
  ])
  const portfolio = p?.length ?? 0
  const published = p?.filter(i => i.is_published).length ?? 0
  return {
    portfolio,
    published,
    draft: portfolio - published,
    text: t?.length ?? 0,
    inbox: c?.length ?? 0,
  }
}
