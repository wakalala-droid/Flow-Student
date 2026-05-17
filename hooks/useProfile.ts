'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      supabase.from('profiles').select('*').eq('id', user.id).single()
        .then(({ data }) => { setProfile(data); setLoading(false) })
    })
  }, [])

  async function refresh() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfile(data)
  }

  const usagePct = profile ? Math.round((profile.words_used / profile.words_limit) * 100) : 0
  const isAtLimit = profile ? profile.words_used >= profile.words_limit : false

  return { profile, loading, refresh, usagePct, isAtLimit }
}
