"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [user, setUser] = useState(null) 
  
  const [showLogin, setShowLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    fetchPolls()
    checkUser() 
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchPolls = async () => {
    const { data, error } = await supabase
      .from('polls')
      .select(`id, title, poll_options ( id, content )`)
      .order('created_at', { ascending: false })

    if (error) alert("Veriler alınamadı")
    else setPolls(data)
    setLoading(false)
  }

  const handleAuth = async (e) => {
    e.preventDefault()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      const { error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) alert("Hata oluştu")
      else alert("Kayıt olundu, tekrar giriş yapın")
    } else {
      setUser(data.user)
      setShowLogin(false)
      alert("Giriş başarılı!")
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    window.location.reload()
  }

  const handleVote = async (pollId, optionId) => {
    if (!user) { 
      alert("Önce giriş yapmalısın!")
      setShowLogin(true)
      return
    }

    const { error } = await supabase
      .from('votes')
      .insert([{ poll_id: pollId, option_id: optionId, user_id: user.id }])

    if (error) alert("Zaten oy verdin veya bir hata oluştu")
    else alert("Oy verildi!")
  }

  if (loading) return <p>Yükleniyor...</p>

  return (
    <div style={{ padding: '20px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Anketler</h1>
        
        {/* varsa çıkış yoksa giriş yaptır */}
        {user ? (
          <div>
            <span>{user.email}</span>
            <button onClick={handleLogout} style={{ marginLeft: '10px' }}>Çıkış Yap</button>
          </div>
        ) : (
          <button onClick={() => setShowLogin(true)}>Giriş Yap</button>
        )}
      </div>
      
      <hr />

      {polls.map((poll) => (
        <div key={poll.id} style={{ borderBottom: '1px solid gray', padding: '10px 0' }}>
          <h3>{poll.title}</h3>
          {poll.poll_options.map((option) => (
            <button 
              key={option.id} 
              onClick={() => handleVote(poll.id, option.id)}
              style={{ marginRight: '10px' }}
            >
              {option.content}
            </button>
          ))}
        </div>
      ))}

      {showLogin && (
        <div style={{
          position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{ backgroundColor: 'white', padding: '20px', border: '1px solid black' }}>
            <h2>Giriş / Kayıt</h2>
            <form onSubmit={handleAuth}>
              <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required /><br /><br />
              <input type="password" placeholder="Şifre" onChange={(e) => setPassword(e.target.value)} required /><br /><br />
              <button type="submit">Devam Et</button>
              <button type="button" onClick={() => setShowLogin(false)} style={{ marginLeft: '10px' }}>Kapat</button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}