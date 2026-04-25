"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useApp } from '@/context/AppContext'
import Navbar from '@/components/Navbar'

export default function CreatePoll() {
  const { user, isDark } = useApp()
  const router = useRouter()
  
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState([
    { content: '', image: null, preview: null },
    { content: '', image: null, preview: null }
  ])

  const handleFileChange = (index, e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert("File too large (Max 5MB)")
      return
    }

    const newOptions = [...options]
    newOptions[index].image = file
    newOptions[index].preview = URL.createObjectURL(file)
    setOptions(newOptions)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return alert("Please log in first")
    setLoading(true)

    try {
      const { data: poll, error: pollErr } = await supabase
        .from('polls')
        .insert([{ title, user_id: user.id }])
        .select()
        .single()

      if (pollErr) throw pollErr

      for (let i = 0; i < options.length; i++) {
        let imageUrl = null

        if (options[i].image) {
          const fileName = `${poll.id}/${Date.now()}-${i}`
          const { error: uploadErr } = await supabase.storage
            .from('poll-images')
            .upload(fileName, options[i].image)
          
          if (uploadErr) throw uploadErr
          
          const { data } = supabase.storage.from('poll-images').getPublicUrl(fileName)
          imageUrl = data.publicUrl
        }

        await supabase.from('poll_options').insert([{ 
          poll_id: poll.id, 
          content: options[i].content, 
          image_url: imageUrl 
        }])
      }

      router.push('/')
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-black'}`}>
      <Navbar />
      
      <div className="max-w-xl mx-auto p-4 mt-10">
        <form onSubmit={handleSubmit} className={`p-6 border rounded ${isDark ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
          <h1 className="text-2xl font-bold mb-6">Create New Poll</h1>
          
          <input 
            required 
            placeholder="What is your question?" 
            className={`w-full p-3 rounded mb-4 border outline-none ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-gray-50 border-gray-300'}`} 
            onChange={e => setTitle(e.target.value)} 
          />

          <div className="flex flex-col gap-3 mb-6">
            {options.map((opt, i) => (
              <div key={i} className={`flex items-center gap-3 p-2 border rounded ${isDark ? 'border-zinc-800' : 'border-gray-200'}`}>
                <input 
                  required 
                  placeholder={`Option ${i+1}`} 
                  className="flex-1 bg-transparent outline-none p-1" 
                  onChange={e => {
                    const newOptions = [...options]
                    newOptions[i].content = e.target.value
                    setOptions(newOptions)
                  }} 
                />
                
                {opt.preview && (
                  <img src={opt.preview} className="w-10 h-10 object-cover rounded" alt="" />
                )}

                <label className="p-2 bg-blue-600 text-white rounded cursor-pointer text-xs font-bold uppercase tracking-wide">
                  Add Image
                  <input type="file" className="hidden" accept="image/*" onChange={e => handleFileChange(i, e)} />
                </label>
              </div>
            ))}
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full p-3 bg-blue-600 text-white rounded font-bold hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {loading ? 'Processing...' : 'Share Poll'}
          </button>
        </form>
      </div>
    </div>
  )
}