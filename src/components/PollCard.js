"use client"

export default function PollCard({ poll, onVote, isDark }) {
  if (!poll?.poll_options) return null

  const hasImages = poll.poll_options.some(opt => opt.image_url)

  return (
    <div className={`p-5 border rounded-2xl shadow-sm mb-4 ${
      isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-gray-200 text-black'
    }`}>
      
      <h3 className="text-xl font-bold mb-5">{poll.title}</h3>

      <div className={hasImages ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "flex flex-col gap-2"}>
        {poll.poll_options.map((opt) => (
          <button 
            key={opt.id} 
            onClick={() => onVote(poll.id, opt.id)} 
            className={`group flex transition-all overflow-hidden border rounded-xl 
              ${hasImages ? 'flex-col' : 'flex-row items-center p-4'} 
              ${isDark ? 'border-zinc-700 hover:bg-zinc-800' : 'border-gray-100 hover:bg-gray-50'}`}
          >
            
            {hasImages && (
              <div className="w-full h-40 overflow-hidden bg-zinc-800/10 border-b border-inherit flex items-center justify-center">
                {opt.image_url ? (
                  <img src={opt.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                ) : (
                  <span className="text-2xl opacity-20">📊</span>
                )}
              </div>
            )}
            
            <div className={`p-4 w-full ${hasImages ? 'text-center' : 'flex-1 text-left'}`}>
              <span className="font-semibold text-lg block truncate">{opt.content}</span>
              
              <div className={`text-blue-500 font-bold transition-all opacity-0 group-hover:opacity-100 ${hasImages ? 'text-xs mt-2' : 'text-sm ml-auto'}`}>
                VOTE {hasImages && '→'}
              </div>
            </div>

          </button>
        ))}
      </div>
    </div>
  )
}