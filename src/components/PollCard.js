"use client"
import { useRouter } from 'next/navigation'


function formatRelativeTime(dateString) {
  if (!dateString) return ''
  const diff = Math.floor((new Date() - new Date(dateString)) / 1000)
  
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function PollCard({ poll, user, onVote, isDark, onCommentClick }) {
  const router = useRouter()


  if (!poll || !poll.poll_options) return null


  const authorName = poll.profiles?.username || 'Anonymous'
  const hasImages = poll.poll_options.some(opt => opt.image_url)
  const commentCount = poll.comments?.length || 0
  

  let totalVotes = 0
  poll.poll_options.forEach(opt => {
    totalVotes += (opt.votes?.length || 0)
  })

  const userVote = user 
    ? poll.poll_options.find(opt => opt.votes?.some(v => v.user_id === user.id))
    : null

  const hasVoted = !!userVote

  return (
    <div className={`p-5 border rounded-2xl transition-all ${
      isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-gray-200 text-black'
    }`}>
      

      <div className="flex items-center gap-2 mb-4 text-sm">
        <a 
          href={`/profile/${authorName}`}
          className="flex items-center gap-2 group transition-opacity hover:opacity-80"
        >
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
            {authorName[0].toUpperCase()}
          </div>
          <span className="font-semibold">{authorName}</span>
        </a>

        <div className={`flex items-center gap-2 ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
          <span className="opacity-50">•</span>
          <span className="opacity-50 text-[12px]">{formatRelativeTime(poll.created_at)}</span>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-5">{poll.title}</h3>


      <div className={hasImages ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "flex flex-col gap-2"}>
        {poll.poll_options.map((opt) => {
          const voteCount = opt.votes?.length || 0
          const percent = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0
          const isMyChoice = opt.id === userVote?.id

          return (
            <button 
              key={opt.id} 
              onClick={() => onVote(poll.id, opt.id)}
              disabled={hasVoted}
              className={`group relative flex overflow-hidden border rounded-xl min-h-14 transition-all
                ${hasImages ? 'flex-col' : 'flex-row items-center p-4'} 
                ${isDark ? 'border-zinc-700' : 'border-gray-100'}
                ${!hasVoted ? (isDark ? 'hover:bg-zinc-800' : 'hover:bg-gray-50') : 'cursor-default'}
                ${isMyChoice ? 'ring-2 ring-blue-500' : ''}
              `}
            >
              
              {hasVoted && (
                <div 
                  className={`absolute left-0 top-0 bottom-0 transition-all duration-700 z-0
                    ${isMyChoice ? 'bg-blue-500/20' : (isDark ? 'bg-white/5' : 'bg-black/5')}
                  `}
                  style={{ width: `${percent}%` }}
                />
              )}

              {hasImages && (
                <div className="w-full h-40 overflow-hidden bg-zinc-800/10 border-b border-inherit flex items-center justify-center z-10 relative">
                  {opt.image_url ? (
                    <img src={opt.image_url} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <span className="text-2xl opacity-20">no image</span>
                  )}
                </div>
              )}
              
              <div className={`relative z-10 flex w-full items-center justify-between ${hasImages ? 'p-4 text-center flex-col' : 'flex-1 text-left'}`}>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-base">{opt.content}</span>
                  {isMyChoice && <span className="text-blue-500 text-sm">✓</span>}
                </div>
                
                {!hasVoted ? (

                  <div className={`text-blue-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity ${hasImages ? 'text-xs mt-2' : 'text-sm'}`}>
                    VOTE
                  </div>
                ) : (

                  <div className={`flex flex-col items-end ${hasImages ? 'mt-2 w-full flex-row justify-between items-center' : ''}`}>
                    <span className="font-bold">{percent}%</span>
                    <span className="text-[10px] opacity-60">{voteCount} votes</span>
                  </div>
                )}
              </div>

            </button>
          )
        })}
      </div>
      
      <div className={`mt-5 flex items-center justify-between border-t pt-4 ${isDark ? 'border-zinc-800' : 'border-gray-100'}`}>
        
        <button 
          onClick={() => {
            if (onCommentClick) {
              onCommentClick() 
            } else {
              router.push(`/poll/${poll.id}`)
            }
          }}
          className={`group flex items-center gap-1.5 text-sm font-bold transition-all px-3 py-1.5 rounded-full ${
            isDark 
              ? 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900'
          }`}
        >
          <img 
            src={isDark ? "/whitecomment.svg" : "/darkcomment.svg"} 
            alt="Discuss" 
            className="w-4 h-4 object-contain opacity-70 group-hover:opacity-100 transition-opacity" 
          />
          <span>{commentCount}</span>
        </button>

        {hasVoted && (
          <div className="text-[10px] text-right opacity-50 font-bold uppercase tracking-widest">
            Total: {totalVotes} {totalVotes === 1 ? 'Vote' : 'Votes'}
          </div>
        )}
      </div>

    </div>
  )
}