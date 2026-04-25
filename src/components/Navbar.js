"use client"
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useApp } from '@/context/AppContext'

export default function Navbar({ onShowLogin }) {
  const { user, isDark } = useApp()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  const name = user?.user_metadata?.display_name || user?.email?.split('@')[0]
  const initial = name ? name[0].toUpperCase() : '?'

  return (
    <nav className={`flex justify-end p-4 border-b ${isDark ? 'bg-black border-gray-800 text-white' : 'bg-white border-gray-300 text-black'}`}>
      <div className="flex items-center gap-4">
        {!user ? (
          <button 
            onClick={onShowLogin} 
            className="p-2 px-4 bg-blue-600 text-white rounded"
          >
            Sign In
          </button>
        ) : (
          <div className="relative">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className={`w-10 h-10 border rounded-full ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-gray-200 border-gray-400'}`}
            >
              {initial}
            </button>

            {isOpen && (
              <div className={`absolute right-0 mt-2 w-48 border shadow ${isDark ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                <div className="p-2 border-b border-gray-500/30">
                  <p className="text-xs text-gray-500">Account</p>
                  <p className="font-bold truncate">@{name}</p>
                </div>
                
                <div className="flex flex-col p-1">
                  <button className="w-full text-left p-2 hover:bg-gray-500/20">
                    Settings
                  </button>
                  
                  <button 
                    onClick={handleLogout} 
                    className="w-full text-left p-2 text-red-500 hover:bg-gray-500/20"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}