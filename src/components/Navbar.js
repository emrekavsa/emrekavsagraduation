"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useApp } from "@/context/AppContext"

export default function Navbar({ onShowLogin }) {
  const { user, isDark } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsOpen(false)
    router.push("/")
  }

  const username = user?.username || "User"

  return (
    <nav className={`flex justify-between items-center p-4 border-b sticky top-0 z-50 ${
      isDark ? "bg-black border-zinc-800 text-white" : "bg-white border-gray-200 text-black"
    }`}>
      
      <Link href="/" className="transition-opacity hover:opacity-80">
        <img 
          src="/poll-icon.svg" 
          alt="Home" 
          className={`w-8 h-8 ${isDark ? 'invert' : ''}`} 
        />
      </Link>

      <div className="flex items-center gap-4">
        {!user ? (
          <button
            onClick={onShowLogin}
            className="p-2 px-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">
            Sign In
          </button>
        ) : (
          <>
            <Link
              href="/create"
              className="p-2 px-4 bg-blue-600 text-white rounded-xl font-bold text-sm">
              + Create Poll
            </Link>

            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-10 h-10 border rounded-full font-bold flex items-center justify-center ${
                  isDark ? "bg-zinc-800 border-zinc-700" : "bg-gray-100 border-gray-300"
                }`}
              >
                {username[0].toUpperCase()}
              </button>

              {isOpen && (
                <div className={`absolute right-0 mt-2 w-48 border shadow-xl rounded-xl p-2 z-50 ${
                  isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"
                }`}>
                  <div className="p-2 border-b border-gray-500/10 text-sm font-bold opacity-70">
                    @{username}
                  </div>
                  
                  <Link
                    href={`/profile/${username}`}
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-left p-2 mt-1 hover:bg-gray-500/10 rounded-lg text-sm font-bold"
                  >
                    View Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left p-2 mt-1 text-red-500 hover:bg-red-500/10 rounded-lg text-sm font-bold"
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