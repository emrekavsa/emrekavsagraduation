"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/context/AppContext";

export default function Navbar({ onShowLogin }) {
  const { user, isDark } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const name = user?.email?.split("@")[0] || "?";

  return (
    <nav
      className={`flex justify-end p-4 border-b ${isDark ? "bg-black border-gray-800 text-white" : "bg-white border-gray-300 text-black"}`}
    >
      <div className="flex items-center gap-4">
        {!user ? (
          <button
            onClick={onShowLogin}
            className="p-2 px-4 bg-blue-600 text-white rounded"
          >
            Sign In
          </button>
        ) : (
          <>
            <Link
              href="/create"
              className="p-2 px-4 bg-blue-600 text-white rounded font-bold text-sm"
            >
              + Create Poll
            </Link>

            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-10 h-10 border rounded-full font-bold ${isDark ? "bg-gray-800 border-gray-600" : "bg-gray-200 border-gray-400"}`}
              >
                {name[0].toUpperCase()}
              </button>

              {isOpen && (
                <div
                  className={`absolute right-0 mt-2 w-48 border shadow-xl z-50 ${isDark ? "bg-black border-gray-800" : "bg-white border-gray-300"}`}
                >
                  <div className="p-2 border-b border-gray-500/30 text-sm font-bold truncate">
                    @{name}
                  </div>
                  <button className="w-full text-left p-2 hover:bg-gray-500/10 text-sm">
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left p-2 text-red-500 hover:bg-gray-500/10 text-sm font-bold"
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
  );
}
