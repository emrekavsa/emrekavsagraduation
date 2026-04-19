import { supabase } from '@/lib/supabase'

export default async function Home() {
  const { data, error } = await supabase.from('polls').select('*')

  if (error) {
    return <h1>Error: {error.message}</h1>
  }

  return (
    <div>
      <h1>connected!</h1>
      <p>{data.length}</p>
    </div>
  )
}