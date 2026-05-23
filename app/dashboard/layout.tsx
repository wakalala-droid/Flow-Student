import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import MobileSidebar from '@/components/layout/MobileSidebar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0f]">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden lg:flex">
        <Sidebar profile={profile} />
      </div>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar profile={profile} mobileSidebar={<MobileSidebar profile={profile} />} />
        <main className="flex-1 overflow-hidden pb-16 lg:pb-0">
          {children}
        </main>
        {/* Mobile bottom nav — hidden on desktop */}
        <div className="lg:hidden">
          <MobileBottomNav />
        </div>
      </div>
    </div>
  )
}
