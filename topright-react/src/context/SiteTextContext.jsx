import { createContext, useContext, useState, useEffect } from 'react'
import { fetchSiteTextMap } from '../services/siteTextService'

const SiteTextContext = createContext({})

export function SiteTextProvider({ children }) {
  const [texts, setTexts] = useState({})

  useEffect(() => {
    fetchSiteTextMap().then(setTexts)
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
