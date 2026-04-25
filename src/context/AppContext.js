"use client"
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isDark, setIsDark] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const themeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDark(themeQuery.matches)

    const handleTheme = (e) => setIsDark(e.matches)
    themeQuery.addEventListener('change', handleTheme)

    const getSession = async () => {
      try {
        const { data: { user: current } } = await supabase.auth.getUser()
        setUser(current)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      themeQuery.removeEventListener('change', handleTheme)
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AppContext.Provider value={{ user, isDark, loading }}>
      <div className={isDark ? 'dark' : ''}>
        {children}
      </div>
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)