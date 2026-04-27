"use client"
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useApp } from '@/context/AppContext'
import Navbar from '@/components/Navbar'
import PollCard from '@/components/PollCard'

export default function PollDetailPage() {
  const { id } = useParams()
  const { user, isDark } = useApp()
  
  const [poll, setPoll] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')
  
  const commentInputRef = useRef(null)

  const fetchData = async () => {
    if (!id) return
    
    const { data: pollData } = await supabase
      .from('polls')
      .select('*, profiles(username), poll_options(*, votes(*)), comments(id)')
      .eq('id', id)
      .single()

    const { data: commentsData } = await supabase
      .from('comments')
      .select('*, profiles(username)')
      .eq('poll_id', id)
      .order('created_at', { ascending: false })

    if (pollData) setPoll(pollData)
    if (commentsData) setComments(commentsData)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [id])

  const handleVote = async (pollId, optionId) => {
    if (!user) return alert("Please sign in to vote!")
    const { error } = await supabase
      .from('votes')
      .insert([{ poll_id: pollId, option_id: optionId, user_id: user.id }])
    if (!error) fetchData()
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!user || !newComment.trim() || submitting) return
    
    setSubmitting(true)
    const { error } = await supabase
      .from('comments')
      .insert([{ poll_id: id, user_id: user.id, content: newComment.trim() }])
    
    if (!error) {
      setNewComment('')
      fetchData()
    }
    setSubmitting(false)
  }

  const handleDeleteComment = async (commentId) => {
    if (!confirm("Delete this comment?")) return
    
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', user.id)

    if (!error) fetchData()
  }

  const handleUpdateComment = async (commentId) => {
    if (!editContent.trim()) return
    
    const { error } = await supabase
      .from('comments')
      .update({ content: editContent.trim() })
      .eq('id', commentId)
      .eq('user_id', user.id)

    if (!error) {
      setEditingId(null)
      fetchData()
    }
  }

  const handleFocusInput = () => {
    if (commentInputRef.current) {
      commentInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      commentInputRef.current.focus()
    }
  }

  if (loading) return <div className="p-10 text-center font-bold">Loading...</div>

  return (
    <div className={`min-h-screen pb-20 ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-black'}`}>
      <Navbar />
      <div className="max-w-xl mx-auto p-4 mt-6">
        <PollCard 
          poll={poll} 
          user={user} 
          onVote={handleVote} 
          isDark={isDark} 
          onCommentClick={handleFocusInput} 
        />

        <div className={`mt-8 p-6 rounded-3xl border shadow-sm ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'}`}>
          <form onSubmit={handleCommentSubmit} className="relative flex items-center mb-10">
            <input
              ref={commentInputRef}
              type="text"
              placeholder={user ? "Write a comment..." : "Sign in to comment"}
              disabled={!user || submitting}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className={`w-full p-4 pr-24 rounded-2xl border outline-none transition-all ${
                isDark ? 'bg-zinc-800 border-zinc-700 focus:border-zinc-500' : 'bg-gray-50 border-gray-200 focus:border-blue-400'
              }`}
            />
            <button 
              type="submit" 
              disabled={submitting || !newComment.trim()}
              className="absolute right-2 px-5 py-2 bg-blue-600 text-white font-bold rounded-xl text-sm disabled:opacity-50"
            >
              Post
            </button>
          </form>

          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-4 group">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">
                  {comment.profiles?.username?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm opacity-80">@{comment.profiles?.username}</span>
                    {user && user.id === comment.user_id && (
                      <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity items-center">
                        <button 
                          onClick={() => { setEditingId(comment.id); setEditContent(comment.content); }} 
                          className="w-4 h-4"
                        >
                          <img src="/edit-icon.svg" alt="Edit" className={isDark ? 'invert' : ''} />
                        </button>
                        <button 
                          onClick={() => handleDeleteComment(comment.id)} 
                          className="w-5 h-5"
                        >
                          <img src="/delete-icon.svg" alt="Delete" className="w-full h-full" />
                        </button>
                      </div>
                    )}
                  </div>
                  {editingId === comment.id ? (
                    <div className="mt-2 space-y-2">
                      <input 
                        className={`w-full p-3 rounded-xl border outline-none ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-50 border-gray-200'}`}
                        value={editContent} 
                        onChange={(e) => setEditContent(e.target.value)} 
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleUpdateComment(comment.id)} 
                          className="text-xs font-bold bg-blue-600 text-white px-3 py-1.5 rounded-lg"
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => setEditingId(null)} 
                          className="text-xs font-bold text-gray-500 px-2"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm opacity-90">{comment.content}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}