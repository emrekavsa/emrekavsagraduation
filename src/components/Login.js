"use client"
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Login({ isOpen, onClose, isDark }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', username: '' })
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        })
        if (error) throw error
        window.location.reload()
      } else {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { display_name: form.username } }
        })
        if (error) throw error
        alert("Registration successful!")
        setMode('login')
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={`p-6 w-full max-w-sm border rounded ${isDark ? 'bg-black border-gray-800 text-white' : 'bg-white border-gray-300 text-black'}`}>
        
        <div className="flex gap-2 mb-4">
          <button 
            onClick={() => setMode('login')}
            className={`flex-1 p-2 rounded ${mode === 'login' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black dark:bg-gray-800 dark:text-white'}`}
          >
            Log In
          </button>
          <button 
            onClick={() => setMode('register')}
            className={`flex-1 p-2 rounded ${mode === 'register' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black dark:bg-gray-800 dark:text-white'}`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === 'register' && (
            <input 
              name="username" 
              placeholder="Username" 
              required 
              onChange={handleChange} 
              className={`p-2 border rounded outline-none ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-300'}`} 
            />
          )}
          <input 
            name="email" 
            type="email" 
            placeholder="Email" 
            required 
            onChange={handleChange} 
            className={`p-2 border rounded outline-none ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-300'}`} 
          />
          <input 
            name="password" 
            type="password" 
            placeholder="Password" 
            required 
            onChange={handleChange} 
            className={`p-2 border rounded outline-none ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-300'}`} 
          />
          
          <button type="submit" disabled={loading} className="p-2 mt-2 bg-blue-600 text-white rounded disabled:opacity-50">
            {loading ? 'Wait...' : (mode === 'login' ? 'Continue' : 'Create Account')}
          </button>
        </form>

        <button onClick={onClose} className="mt-4 w-full text-center text-red-500">
          Dismiss
        </button>
        
      </div>
    </div>
  )
}