import { supabase } from '@/lib/supabase'
import { voteAction } from '@/lib/actions'
import type { AppUser, Poll } from '@/types/domain'

const POLL_SELECT = '*, profiles(username, id, avatar_url), poll_options(id, content, image_url, votes(user_id)), comments(id)'

type HandleVoteParams = {
  user: AppUser | null
  pollId: string
  optionId: string
  requireLogin: () => void
  onSuccess: (poll: Poll) => void
}

export async function handleVote({ user, pollId, optionId, requireLogin, onSuccess }: HandleVoteParams) {
  if (!user) return requireLogin()

  const result = await voteAction({ poll_id: pollId, option_id: optionId, user_id: user.id })

  if (result.success) {
    const { data: updatedPoll } = await supabase
      .from('polls')
      .select(POLL_SELECT)
      .eq('id', pollId)
      .single()

    if (updatedPoll) onSuccess(updatedPoll as Poll)
  } else {
    if (result.error.includes('duplicate key') || result.error.includes('unique constraint')) {
      alert('You have already voted!')
    } else {
      alert(result.error)
    }
  }
}
