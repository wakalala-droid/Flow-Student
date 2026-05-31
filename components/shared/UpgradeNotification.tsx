'use client'
// components/UpgradeNotification.tsx
// Add this component to your dashboard layout

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function UpgradeNotification() {
  const [message, setMessage] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    checkNotification()
  }, [])

  async function checkNotification() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('notification_message, notification_shown')
      .eq('id', user.id)
      .limit(1)

    const profile = data?.[0]
    if (profile?.notification_message && !profile?.notification_shown) {
      setMessage(profile.notification_message)
      // Mark as shown
      await supabase
        .from('profiles')
        .update({ notification_shown: true })
        .eq('id', user.id)
    }
  }

  if (!message) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="card p-8 max-w-md w-full text-center space-y-5 border border-[#6c63ff]/40">
        <div className="text-5xl">🎉</div>
        <h2 className="text-xl font-bold text-[#e8e8f0]">Account Upgraded!</h2>
        <p className="text-sm text-[#7a7a9a] leading-relaxed">{message}</p>
        <div className="bg-[#6c63ff]/10 rounded-xl p-4 border border-[#6c63ff]/20">
          <p className="text-xs text-violet-300">Your new limits are active right now. Enjoy!</p>
        </div>
        <button
          onClick={() => setMessage(null)}
          className="w-full py-3 rounded-xl bg-[#6c63ff] hover:bg-[#7c73ff] text-white font-semibold transition-all"
        >
          Let's Go! 🚀
        </button>
      </div>
    </div>
  )
}
