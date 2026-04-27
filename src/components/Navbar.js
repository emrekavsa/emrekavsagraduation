"use client"
import { useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useApp } from "@/context/AppContext"

export default function Navbar({ onShowLogin }) {
  const { user, isDark } = useApp()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    try {
      setIsOpen(false)
      await supabase.auth.signOut()
      window.location.href = "/"
    } catch (err) {
      console.error(err.message)
    }
  }

  const displayName = user?.user_metadata?.username || user?.username || "Account"

  return (
    <nav className={`flex justify-between items-center p-4 border-b sticky top-0 z-50 ${
      isDark ? "bg-black border-zinc-800 text-white" : "bg-white border-gray-200 text-black"
    }`}>
      
      <a 
        href="/" 
        className="flex items-center gap-2 group transition-opacity hover:opacity-80"
      >
        <img 
          src="/poll-icon.svg" 
          alt="Home" 
          className={`w-8 h-8 transition-all ${isDark ? 'invert' : ''}`} 
        />
      </a>

      <div className="flex items-center gap-4">
        {!user ? (
          <button
            onClick={onShowLogin}
            className="p-2 px-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        ) : (
          <>
            <Link
              href="/create"
              className="p-2 px-4 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors"
            >
              + Create Poll
            </Link>

            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-10 h-10 border rounded-full font-bold flex items-center justify-center transition-all ${
                  isDark ? "bg-zinc-800 border-zinc-700" : "bg-gray-100 border-gray-300"
                }`}
              >
                {displayName[0].toUpperCase()}
              </button>

              {isOpen && (
                <div className={`absolute right-0 mt-2 w-48 border shadow-xl rounded-xl p-2 z-50 ${
                  isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"
                }`}>
                  <div className="p-2 border-b border-gray-500/10 text-sm font-bold truncate opacity-70">
                    @{displayName}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left p-2 mt-1 text-red-500 hover:bg-red-500/10 rounded-lg text-sm font-bold transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  )
}