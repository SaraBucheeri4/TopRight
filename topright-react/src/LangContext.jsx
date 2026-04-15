import { createContext, useContext, useState } from 'react'

const LangContext = createContext({ lang: 'en', toggleLang: () => {} })

export function LangProvider({ children }) {
  const [lang, setLang] = useState('en')
  const toggleLang = () => setLang(l => (l === 'en' ? 'ar' : 'en'))
  return (
    <LangContext.Provider value={{ lang, toggleLang }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
