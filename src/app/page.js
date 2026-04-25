"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useApp } from '@/context/AppContext'
import Navbar from '@/components/Navbar'
import PollCard from '@/components/PollCard'
import Login from '@/components/Login'

export default function Home() {
  const { user, isDark, loading } = useApp()
  const [polls, setPolls] = useState([])
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  useEffect(() => {
    fetchPolls()
  }, [])

  const fetchPolls = async () => {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select('id, title, poll_options(id, content)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPolls(data || [])
    } catch (error) {
      console.error(error.message)
    }
  }

  const handleVote = async (pollId, optionId) => {
    if (!user) {
      setIsLoginOpen(true)
      return
    }

    try {
      const { error } = await supabase
        .from('votes')
        .insert([{ poll_id: pollId, option_id: optionId, user_id: user.id }])

      if (error) {
        alert(error.code === '23505' ? "You already voted!" : "An error occurred.")
      } else {
        alert("Vote successful!")
      }
    } catch (error) {
      console.error(error.message)
    }
  }

  if (loading) {
    return (
      <div className={`h-screen flex items-center justify-center ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
        Loading...
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-black'}`}>
      <Navbar onShowLogin={() => setIsLoginOpen(true)} />

      <div className="max-w-xl mx-auto p-4 mt-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Polls</h1>
          <p className="text-gray-500">Vote on community polls</p>
        </div>

        <div className="flex flex-col gap-4">
          {polls.length > 0 ? (
            polls.map((poll) => (
              <PollCard 
                key={poll.id} 
                poll={poll} 
                onVote={handleVote} 
                isDark={isDark} 
              />
            ))
          ) : (
            <p className="text-center text-gray-500">No polls yet.</p>
          )}
        </div>
      </div>

      <Login 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        isDark={isDark}
      />
    </div>
  )
}