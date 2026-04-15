import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const SiteTextContext = createContext({})

export function SiteTextProvider({ children }) {
  const [texts, setTexts] = useState({})

  useEffect(() => {
    supabase
      .from('site_text')
      .select('key, value_en, value_ar')
      .then(({ data }) => {
        if (!data) return
        const map = {}
        data.forEach(row => { map[row.key] = { value_en: row.value_en, value_ar: row.value_ar } })
        setTexts(map)
      })
  }, [])

  return (
    <SiteTextContext.Provider value={texts}>
      {children}
    </SiteTextContext.Provider>
  )
}

export function useSiteText(key) {
  const texts = useContext(SiteTextContext)
  return texts[key] ?? { value_en: null, value_ar: null }
}
