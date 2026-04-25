"use client"

export default function PollCard({ poll, onVote, isDark }) {
  return (
    <div className={`p-6 border rounded mb-4 ${isDark ? 'bg-black border-gray-800 text-white' : 'bg-white border-gray-300 text-black'}`}>
      
      <h3 className="text-xl font-bold mb-4">
        {poll.title}
      </h3>
      
      <div className="flex flex-col gap-2">
        {poll.poll_options?.map((option) => (
          <button 
            key={option.id} 
            onClick={() => onVote(poll.id, option.id)}
            className={`w-full p-3 text-left border rounded ${isDark ? 'border-gray-600 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-100'}`}
          >
            {option.content}
          </button>
        ))}
      </div>
      
    </div>
  )
}