import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Landing from '@/components/landing/Landing'

export default async function RootPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard/humanizer')
  return <Landing />
}
