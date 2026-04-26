"use client"
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isDark, setIsDark] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (sessionUser) => {
    if (!sessionUser) return null
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', sessionUser.id)
      .single()
    
    return { ...sessionUser, username: data?.username || 'User' }
  }

  useEffect(() => {
    const themeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDark(themeQuery.matches)

    const handleTheme = (e) => setIsDark(e.matches)
    themeQuery.addEventListener('change', handleTheme)

    const getInitialSession = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          const fullUser = await fetchProfile(authUser)
          setUser(fullUser)
        }
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
      } else if (session?.user) {
        const fullUser = await fetchProfile(session.user)
        setUser(fullUser)
      } else {
        setUser(null)
      }
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